#!/bin/bash

if ! command -v fzf &>/dev/null; then
  echo "fzf is required. Install it via: sudo apt install fzf -y"
  exit 1
fi

if ! command -v yq &>/dev/null; then
  echo "yq is required to parse YAML. Install with: sudo snap install yq"
  exit 1
fi

FREQTRADE_HOME="${FREQTRADE_HOME:-$HOME/python-projects/freqtrade}"
MENU_YAML="$FREQTRADE_HOME/user_data/menu.yaml"
CHEAT_SHEET="$FREQTRADE_HOME/user_data/Freqtrade_Command_CheatSheet.md"
LOG_FILE="$FREQTRADE_HOME/user_data/logs/freqtrade.log"
STRATEGY_DIR="$FREQTRADE_HOME/user_data/strategies"
DATA_DIR="$FREQTRADE_HOME/user_data/data"
CONFIG_DIR="$FREQTRADE_HOME/user_data/configs"

LOG_EXEC="$FREQTRADE_HOME/user_data/command_history.log"

DEFAULT_CONFIG="$FREQTRADE_HOME/user_data/config.json"
DEFAULT_TIMERANGE="20240501-20240701"

declare -A COMMAND_MAP
COMMAND_MAP["View Cheat Sheet"]='batcat "$CHEAT_SHEET" 2>/dev/null || cat "$CHEAT_SHEET"'
COMMAND_MAP["Backtest"]='if find "$DATA_DIR" -name "*.json" | grep -q .; then ft-backtest; else echo "No backtest data found."; fi'
COMMAND_MAP["View Logs"]='tail -n 100 -f "$LOG_FILE"'
COMMAND_MAP["List Strategies"]='ls -1 "$STRATEGY_DIR" | grep ".py$"'
COMMAND_MAP["Generate menu.yaml"]='bash "$FREQTRADE_HOME/scripts/gen_menu.sh"'
COMMAND_MAP["Exit"]='exit 0'

# --- START: New additions/modifications ---

# Check for default config file existence
if [[ ! -f "$DEFAULT_CONFIG" ]]; then
  echo "Error: Freqtrade configuration file not found at $DEFAULT_CONFIG"
  echo "Please ensure 'config.json' exists in your user_data directory."
  echo "You might need to copy 'config.json.example' and rename it to 'config.json'."
  exit 1
fi

if [[ ! -f "$MENU_YAML" ]]; then
  echo "menu.yaml not found at $MENU_YAML"
  exit 1
fi

# Populate COMMAND_MAP with entries from menu.yaml
# Read labels and commands from menu.yaml
mapfile -t menu_labels < <(yq '.menu[].label' "$MENU_YAML")
mapfile -t menu_commands < <(yq '.menu[].command' "$MENU_YAML")

for i in "${!menu_labels[@]}"; do
  label="${menu_labels[$i]//\"/}"
  command_str="${menu_commands[$i]//\"/}"
  COMMAND_MAP["$label"]="$command_str"
done

# Read descriptions for fzf display
mapfile -t descriptions < <(yq '.menu[].description' "$MENU_YAML") # This line was already there, keeping it for context

options=()
for i in "${!menu_labels[@]}"; do # Use menu_labels for iteration
  label="${menu_labels[$i]//\"/}"
  desc="${descriptions[$i]//\"/}" # Use descriptions for fzf display

  # Check if submenu exists for the current menu item
  # Note: The 'submenu' logic in menu.yaml is not present in the provided menu.yaml.
  # If you add submenus later, ensure they have 'label' and 'command' for COMMAND_MAP.
  if yq ".menu[$i] | has(\"submenu\")" "$MENU_YAML" | grep -q "true"; then
    mapfile -t sub_labels       < <(yq ".menu[$i].submenu[].label" "$MENU_YAML")
    mapfile -t sub_descriptions < <(yq ".menu[$i].submenu[].description" "$MENU_YAML")
    mapfile -t sub_commands     < <(yq ".menu[$i].submenu[].command" "$MENU_YAML") # Get submenu commands

    for j in "${!sub_labels[@]}"; do
      sub_label="${sub_labels[$j]//\"/}"
      sub_desc="${sub_descriptions[$j]//\"/}"
      sub_command="${sub_commands[$j]//\"/}" # Get submenu command

      COMMAND_MAP["$sub_label"]="$sub_command" # Add submenu command to COMMAND_MAP
      options+=("$sub_label | $sub_desc")
    done
  else
    options+=("$label | $desc")
  fi
done

# --- END: New additions/modifications ---


if [[ -d "$STRATEGY_DIR" ]]; then
  while IFS= read -r strat; do
    strat_file="$(basename "$strat")"
    label="Run Strategy: $strat_file"
    if python3 -m py_compile "$strat" &>/dev/null; then
      strat_config="$CONFIG_DIR/${strat_file%.py}.json"
      config_path="$DEFAULT_CONFIG"
      [[ -f "$strat_config" ]] && config_path="$strat_config"
      COMMAND_MAP["$label"]="freqtrade backtesting --strategy ${strat_file%.py} --config $config_path --timerange $DEFAULT_TIMERANGE"
      options+=("$label | Backtest using $strat_file")
    else
      echo "⚠️ Skipping invalid strategy (syntax error): $strat_file"
    fi
  done < <(find "$STRATEGY_DIR" -maxdepth 1 -name "*.py")
fi

while true; do
  selection=$(printf "%s\n" "${options[@]}" | \
    fzf --prompt="Freqtrade Menu: " \
        --height=40% \
        --reverse \
        --with-nth=1 \
        --delimiter="|" \
        --preview-window=down:3:hidden \
        --preview="echo {} | cut -d'|' -f2" \
        --color=bg+:#313244,bg:#1e1e2e,fg:#cdd6f4,fg+:#cdd6f4,hl:#f38ba8,hl+:#f38ba8,info:#cba6f7,marker:#f38ba8,pointer:#f38ba8,prompt:#f38ba8,spinner:#f38ba8,header:#f38ba8) # Added color options

  [[ -z "$selection" ]] && break

  selected_label="$(echo "$selection" | cut -d'|' -f1 | xargs)"

  echo "[$(date +"%F %T")] Executed: $selected_label" >> "$LOG_EXEC"

  if [[ -n "${COMMAND_MAP[$selected_label]}" ]]; then
    eval "${COMMAND_MAP[$selected_label]}"
  else
    echo "Command not recognized or not allowed: $selected_label"
  fi
done
