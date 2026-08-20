#!/usr/bin/env python3
"""
Demo Factory
============
Runs inside GitHub Actions (demo-factory.yml) to:
  1. Create a Snowflake database + load sample CSV data
  2. Create/verify the ThoughtSpot "Embed Demos DND" Snowflake connection
  3. Branch from origin/doordash, write env scaffold, push

Inputs (all via environment variables):
  SUBMISSION_JSON_B64  — base64-encoded JSON submission from the Demo Builder
  SNOWFLAKE_ACCOUNT    — THOUGHTSPOT_PARTNER
  SNOWFLAKE_USER       — SE_DEMO_KP
  SNOWFLAKE_PRIVATE_KEY       — PEM contents of the encrypted private key
  SNOWFLAKE_PRIVATE_KEY_PASSPHRASE — key passphrase
  SNOWFLAKE_WAREHOUSE  — SE_DEMO_WH
  SNOWFLAKE_ROLE       — SE_ROLE
  TS_HOST              — https://se-thoughtspot-cloud.thoughtspot.cloud
  TS_ADMIN_USER        — admin username in ThoughtSpot
  TOKEN_SERVICE_URL    — deployed token-service URL
  TOKEN_SERVICE_API_KEY — bearer key for the token service
"""

import base64
import csv
import io
import json
import os
import re
import subprocess
import sys
import tempfile

import requests
from cryptography.hazmat.primitives.serialization import (
    Encoding,
    NoEncryption,
    PrivateFormat,
    load_pem_private_key,
)

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
SUBMISSION_JSON_B64 = os.environ["SUBMISSION_JSON_B64"]
SF_ACCOUNT   = os.environ["SNOWFLAKE_ACCOUNT"]    # THOUGHTSPOT_PARTNER
SF_USER      = os.environ["SNOWFLAKE_USER"]        # SE_DEMO_KP
SF_PK_PEM    = os.environ["SNOWFLAKE_PRIVATE_KEY"]
SF_PK_PASS   = os.environ.get("SNOWFLAKE_PRIVATE_KEY_PASSPHRASE", "")
SF_WAREHOUSE = os.environ["SNOWFLAKE_WAREHOUSE"]   # SE_DEMO_WH
SF_ROLE      = os.environ["SNOWFLAKE_ROLE"]        # SE_ROLE
TS_HOST       = os.environ["TS_HOST"].rstrip("/")
TS_ADMIN_USER = os.environ["TS_ADMIN_USER"]
TOKEN_SVC_URL = os.environ["TOKEN_SERVICE_URL"].rstrip("/")
TOKEN_SVC_KEY = os.environ["TOKEN_SERVICE_API_KEY"]

TS_CONNECTION_NAME = "Embed Demos DND"


def log(msg: str) -> None:
    print(f"  → {msg}", flush=True)


# ---------------------------------------------------------------------------
# 0. Parse submission
# ---------------------------------------------------------------------------
def parse_submission() -> dict:
    raw = base64.b64decode(SUBMISSION_JSON_B64).decode()
    return json.loads(raw)


def db_name_for(company: str) -> str:
    """Convert company name to a valid Snowflake DB identifier."""
    slug = re.sub(r"[^A-Z0-9_]", "_", company.upper().replace(" ", "_"))
    return f"{slug}_DEMO"


# ---------------------------------------------------------------------------
# 1. Snowflake
# ---------------------------------------------------------------------------
def _sf_private_key_der() -> bytes:
    """Decrypt the encrypted private key and return DER bytes for the SF connector."""
    passphrase = SF_PK_PASS.encode() if SF_PK_PASS else None
    pk = load_pem_private_key(SF_PK_PEM.encode(), password=passphrase)
    return pk.private_bytes(Encoding.DER, PrivateFormat.PKCS8, NoEncryption())


def _sf_connect(database: str | None = None):
    import snowflake.connector  # imported lazily so non-SF errors surface clearly

    params = dict(
        account=SF_ACCOUNT,
        user=SF_USER,
        private_key=_sf_private_key_der(),
        warehouse=SF_WAREHOUSE,
        role=SF_ROLE,
    )
    if database:
        params["database"] = database
    return snowflake.connector.connect(**params)


def _infer_sf_type(values: list[str]) -> str:
    non_empty = [v for v in values if v.strip()]
    if not non_empty:
        return "VARCHAR"
    try:
        [int(v.replace(",", "")) for v in non_empty]
        return "NUMBER"
    except ValueError:
        pass
    try:
        [float(v.replace(",", "")) for v in non_empty]
        return "FLOAT"
    except ValueError:
        pass
    return "VARCHAR"


def create_snowflake_db(submission: dict) -> str:
    company  = submission["companyName"]
    db       = db_name_for(company)
    data_url = submission.get("sampleDataUrl")

    log(f"Connecting to Snowflake account: {SF_ACCOUNT}")
    conn = _sf_connect()
    cur  = conn.cursor()

    cur.execute(f'CREATE DATABASE IF NOT EXISTS "{db}"')
    cur.execute(f'USE DATABASE "{db}"')
    cur.execute("CREATE SCHEMA IF NOT EXISTS PUBLIC")
    cur.execute("USE SCHEMA PUBLIC")
    log(f"Database ready: {db}")

    if data_url:
        log(f"Downloading sample data …")
        resp = requests.get(data_url, timeout=60)
        resp.raise_for_status()

        reader     = csv.DictReader(io.StringIO(resp.text))
        rows       = list(reader)
        headers    = list(reader.fieldnames or [])

        if rows and headers:
            samples    = rows[:100]
            col_types  = {h: _infer_sf_type([r.get(h, "") for r in samples]) for h in headers}
            table_name = re.sub(r"[^A-Z0-9_]", "_", company.upper().replace(" ", "_")) + "_DATA"
            col_defs   = ", ".join(f'"{h}" {col_types[h]}' for h in headers)

            cur.execute(f'CREATE OR REPLACE TABLE "{table_name}" ({col_defs})')
            log(f"Table created: {table_name} ({len(headers)} columns, ~{len(rows)} rows)")

            # Write CSV to a temp file; use PUT + COPY INTO for bulk load
            with tempfile.NamedTemporaryFile(
                mode="w", suffix=".csv", delete=False, newline=""
            ) as tmp:
                writer = csv.DictWriter(tmp, fieldnames=headers)
                writer.writeheader()
                writer.writerows(rows)
                tmp_path = tmp.name

            cur.execute(
                f'PUT file://{tmp_path} @%"{table_name}" '
                f"AUTO_COMPRESS=TRUE OVERWRITE=TRUE"
            )
            cur.execute(
                f'COPY INTO "{table_name}" '
                f"FILE_FORMAT=(TYPE=CSV FIELD_OPTIONALLY_ENCLOSED_BY='\"' "
                f"SKIP_HEADER=1 ERROR_ON_COLUMN_COUNT_MISMATCH=FALSE) "
                f"PURGE=TRUE"
            )
            log(f"Loaded {len(rows)} rows ✓")
    else:
        log("No sample data URL — DB created empty (load data manually via SnowSQL)")

    cur.close()
    conn.close()
    return db


# ---------------------------------------------------------------------------
# 2. ThoughtSpot connection
# ---------------------------------------------------------------------------
def _ts_token() -> str:
    resp = requests.post(
        f"{TOKEN_SVC_URL}/api/token",
        headers={
            "Authorization": f"Bearer {TOKEN_SVC_KEY}",
            "Content-Type": "application/json",
        },
        json={"username": TS_ADMIN_USER},
        timeout=30,
    )
    resp.raise_for_status()
    return resp.json()["token"]


def manage_ts_connection(db_name: str, submission: dict) -> None:
    log("Fetching ThoughtSpot admin token …")
    token   = _ts_token()
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
        "Accept": "application/json",
    }

    # Search for existing connection
    search = requests.post(
        f"{TS_HOST}/api/rest/2.0/connections/search",
        headers=headers,
        json={"name_pattern": TS_CONNECTION_NAME},
        timeout=30,
    )
    existing_id: str | None = None
    if search.ok:
        for c in search.json():
            if c.get("name") == TS_CONNECTION_NAME:
                existing_id = c.get("id")
                break

    sf_cfg = {
        "accountName":          SF_ACCOUNT,
        "user":                  SF_USER,
        "password":              "",
        "privateKey":            SF_PK_PEM,
        "privateKeyPassPhrase":  SF_PK_PASS,
        "role":                  SF_ROLE,
        "warehouse":             SF_WAREHOUSE,
        "database":              db_name,
        "schema":                "PUBLIC",
    }

    if existing_id:
        log(f"Connection '{TS_CONNECTION_NAME}' already exists (id={existing_id})")
        log(
            f"ACTION NEEDED: open TS → Data → Connections → {TS_CONNECTION_NAME} "
            f"and add tables from database '{db_name}'"
        )
    else:
        log(f"Creating ThoughtSpot connection: {TS_CONNECTION_NAME}")
        create = requests.post(
            f"{TS_HOST}/api/rest/2.0/connections/create",
            headers=headers,
            json={
                "name": TS_CONNECTION_NAME,
                "data_warehouse_type": "SNOWFLAKE",
                "validate": False,
                "data_warehouse_config": {
                    "configuration": sf_cfg,
                    "db_version": "",
                },
            },
            timeout=30,
        )
        if create.ok:
            log(f"Connection '{TS_CONNECTION_NAME}' created ✓")
        else:
            log(f"WARNING: connection create returned {create.status_code}: {create.text[:300]}")


# ---------------------------------------------------------------------------
# 3. Git branch from doordash template
# ---------------------------------------------------------------------------
def create_demo_branch(submission: dict, db_name: str) -> str:
    company = submission["companyName"]
    slug    = re.sub(r"[^a-z0-9]+", "-", company.lower()).strip("-")
    branch  = f"{slug}-demo"

    subprocess.run(["git", "config", "user.email", "demo-factory@ts-embed.vercel.app"], check=True)
    subprocess.run(["git", "config", "user.name", "Demo Factory"], check=True)
    subprocess.run(["git", "fetch", "origin"], check=True)
    subprocess.run(["git", "checkout", "-b", branch, "origin/doordash"], check=True)

    # Write a non-secret env scaffold for the Vercel deploy
    lines = [
        f"# Generated by Demo Factory for: {company}",
        f"# Add these as Vercel environment variables for branch: {branch}",
        f"",
        f"NEXT_PUBLIC_BRAND_NAME={company}",
        f"NEXT_PUBLIC_TS_HOST={submission.get('tsInstance', '')}",
    ]
    if submission.get("website"):
        lines.append(f"# Website: {submission['website']}")
    if submission.get("useSpotter") and submission.get("spotterName"):
        lines.append(f"NEXT_PUBLIC_SPOTTER_PERSONA_NAME={submission['spotterName']}")
    if submission.get("rlsRequired"):
        lines.append(f"# RLS required — rules: {submission.get('rlsRules', 'see submission')}")
    lines += [
        f"",
        f"# Snowflake database: {db_name}",
        f"# ThoughtSpot connection: {TS_CONNECTION_NAME}",
        f"",
        f"# Secrets to add in Vercel (never commit these):",
        f"# TOKEN_SERVICE_URL=<from token-service deploy>",
        f"# DEMO_API_KEY=<new key registered in token-service REGISTRY>",
        f"# TS_SECRET_KEY=<from TS admin panel>",
        f"# TS_ORG_IDENTIFIER=<org id>",
    ]

    with open(".env.generated", "w") as f:
        f.write("\n".join(lines) + "\n")

    subprocess.run(["git", "add", ".env.generated"], check=True)
    subprocess.run(
        ["git", "commit", "-m",
         f"Demo Factory: scaffold {company} demo\n\n"
         f"Snowflake DB: {db_name}\n"
         f"ThoughtSpot connection: {TS_CONNECTION_NAME}"],
        check=True,
    )
    subprocess.run(["git", "push", "origin", branch], check=True)
    log(f"Branch pushed: {branch}")
    return branch


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    print("=" * 60)
    print("ThoughtSpot Demo Factory")
    print("=" * 60)

    submission = parse_submission()
    company    = submission["companyName"]
    print(f"\nBuilding demo for: {company}\n")

    # Step 1 — Snowflake
    print("[ 1/3 ] Snowflake")
    db_name = create_snowflake_db(submission)

    # Step 2 — ThoughtSpot
    print("\n[ 2/3 ] ThoughtSpot Connection")
    try:
        manage_ts_connection(db_name, submission)
    except Exception as exc:
        log(f"WARNING: ThoughtSpot step failed — {exc}")
        log("You can create/update the connection manually in the TS UI")

    # Step 3 — Git branch
    print("\n[ 3/3 ] Git Branch")
    branch = create_demo_branch(submission, db_name)

    print("\n" + "=" * 60)
    print(f"  Done!")
    print(f"  Snowflake DB  : {db_name}")
    print(f"  Git branch    : {branch}")
    print(f"  Next steps    : set Vercel env vars from .env.generated,")
    print(f"                  add tables in TS connection '{TS_CONNECTION_NAME}'")
    print("=" * 60)
