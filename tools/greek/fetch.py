#!/usr/bin/env python3
"""Download every dataset in sources.json at its pinned commit.

Each source goes into its own folder under the cache folder (default tools/greek/.cache, not committed).
Only the listed paths are checked out, so the download stays small. Same approach as Threads' build/fetch.py.

Usage: python3 tools/greek/fetch.py [cache_dir] [source_id ...]
"""
import json
import os
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))


def run(args, cwd=None):
    env = dict(os.environ, GIT_LFS_SKIP_SMUDGE="1")
    r = subprocess.run(args, cwd=cwd, capture_output=True, text=True, env=env)
    if r.returncode != 0:
        raise RuntimeError(f"{' '.join(args)}\n{r.stderr.strip()}")
    return r.stdout.strip()


def fetch(src, cache):
    dest = os.path.join(cache, src["id"])
    if not os.path.isdir(os.path.join(dest, ".git")):
        os.makedirs(dest, exist_ok=True)
        run(["git", "init", "-q"], cwd=dest)
        run(["git", "remote", "add", "origin", f"https://github.com/{src['repo']}"], cwd=dest)
    run(["git", "fetch", "-q", "--depth", "1", "--filter=blob:none", "origin", src["commit"]], cwd=dest)
    run(["git", "sparse-checkout", "init", "--no-cone"], cwd=dest)
    run(["git", "sparse-checkout", "set", "--no-cone"] + src["paths"], cwd=dest)
    run(["git", "checkout", "-q", "FETCH_HEAD"], cwd=dest)
    got = run(["git", "rev-parse", "HEAD"], cwd=dest)
    if got != src["commit"]:
        raise RuntimeError(f"{src['id']}: expected {src['commit']}, got {got}")
    return got


def main():
    cache = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, ".cache")
    only = set(sys.argv[2:])
    with open(os.path.join(HERE, "sources.json"), encoding="utf-8") as f:
        sources = json.load(f)["sources"]
    failed = False
    for src in sources:
        if only and src["id"] not in only:
            continue
        try:
            print(f"ok    {src['id']:14} {fetch(src, cache)}")
        except Exception as e:
            failed = True
            print(f"FAIL  {src['id']:14} {e}")
    sys.exit(1 if failed else 0)


if __name__ == "__main__":
    main()
