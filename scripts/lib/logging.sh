#!/usr/bin/env bash
# logging for bash, yeah.
info() {
  echo -e " \033[32m::\033[0m $*"
}

info_sub() {
  echo -e "    \033[1m->\033[0m $*"
}

error() {
  echo -e "\033[31mError:\033[0m $*" >&2
}

warn() {
  echo -e "\033[33mWarn:\033[0m $*"
}

fatal() {
  error "$@"
  exit 1
}
