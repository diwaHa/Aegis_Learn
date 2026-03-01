"""
tests/conftest.py — Adds middleware/ to sys.path so `app.*` imports work.
"""
import sys, os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
