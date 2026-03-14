import json
import os
import glob

workspace = r"c:\Users\Adm\Downloads\eoorddinasmart"
files_to_check = glob.glob(os.path.join(workspace, "**/*.json"), recursive=True)

modified_files = []

for filepath in files_to_check:
    if "node_modules" in filepath or "mobile-app\\node_modules" in filepath:
        continue
        
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except Exception as e:
        continue
        
    changed = False
    if isinstance(data, dict) and "nodes" in data:
        for node in data["nodes"]:
            if node.get("type") == "n8n-nodes-base.code":
                params = node.get("parameters", {})
                jsCode = params.get("jsCode", "")
                
                original_jsCode = jsCode
                
                # Update comment
                if "Apenas admissões a partir de 01/01/2026" in jsCode:
                    jsCode = jsCode.replace("Apenas admissões a partir de 01/01/2026", "Admissões de 01/01/2026 até Hoje -1")
                if "Liberação E-COORDINA >= 01/01/2026" in jsCode:
                    jsCode = jsCode.replace("Liberação E-COORDINA >= 01/01/2026", "Liberação E-COORDINA entre 01/01/2026 e Hoje -1")
                
                # Case 1: DATA_CORTE pattern
                if "const DATA_CORTE = new Date(Date.UTC(2026, 0, 1));" in jsCode:
                    if "const DATA_FIM =" not in jsCode:
                        jsCode = jsCode.replace(
                            "const DATA_CORTE = new Date(Date.UTC(2026, 0, 1));",
                            "const DATA_CORTE = new Date(Date.UTC(2026, 0, 1));\nconst DATA_FIM = new Date();\nDATA_FIM.setDate(DATA_FIM.getDate() - 1);"
                        )
                
                # Updating Condition for Case 1 (admissao)
                if "if (!objDateAdmissao || objDateAdmissao < DATA_CORTE) {" in jsCode:
                    jsCode = jsCode.replace(
                        "if (!objDateAdmissao || objDateAdmissao < DATA_CORTE) {",
                        "if (!objDateAdmissao || objDateAdmissao < DATA_CORTE || objDateAdmissao > DATA_FIM) {"
                    )
                # Updating condition for Case 1 (liberacao)
                if "if (!objDateLiberacao || objDateLiberacao < DATA_CORTE) {" in jsCode:
                    jsCode = jsCode.replace(
                        "if (!objDateLiberacao || objDateLiberacao < DATA_CORTE) {",
                        "if (!objDateLiberacao || objDateLiberacao < DATA_CORTE || objDateLiberacao > DATA_FIM) {"
                    )
                if "if (!objDateLiberacao || objDateLiberacao < DATA_CORTE) continue;" in jsCode:
                    jsCode = jsCode.replace(
                        "if (!objDateLiberacao || objDateLiberacao < DATA_CORTE) continue;",
                        "if (!objDateLiberacao || objDateLiberacao < DATA_CORTE || objDateLiberacao > DATA_FIM) continue;"
                    )
                    
                # Case 2: FILTER_START / FILTER_END pattern
                if "const FILTER_END = new Date(); // Data/Hora atual do servidor" in jsCode:
                    if "FILTER_END.setDate" not in jsCode:
                        jsCode = jsCode.replace(
                            "const FILTER_END = new Date(); // Data/Hora atual do servidor",
                            "const FILTER_END = new Date(); // Data/Hora atual do servidor\n  FILTER_END.setDate(FILTER_END.getDate() - 1);"
                        )

                # Updating FILTER array condition just in case (though it might already check > FILTER_END)
                
                if jsCode != original_jsCode:
                    node["parameters"]["jsCode"] = jsCode
                    changed = True

    if changed:
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=4, ensure_ascii=False)
        modified_files.append(filepath)

print("Modified files:")
for f in modified_files:
    print(f)
