import pandas as pd
import sys
import os

def audit():
    file_path = r'c:\Users\Adm\Downloads\eoorddinasmart\planilha_modelo\002  Controle de Liberação Complexo Azulão 950 - 02-02-2026 - HA.xlsx'
    if not os.path.exists(file_path):
        print(f"ERRO: Arquivo não encontrado em {file_path}")
        return

    try:
        xl = pd.ExcelFile(file_path)
        sheet_name = 'PR-1 ELECNOR'
        if sheet_name not in xl.sheet_names:
            print(f"ERRO: Aba '{sheet_name}' não encontrada. Abas disponíveis: {xl.sheet_names}")
            return

        # Lê um pedaço para achar o cabeçalho
        df_raw = xl.parse(sheet_name, nrows=50, header=None)
        header_idx = -1
        for i, row in df_raw.iterrows():
            row_vals = [str(x).strip().upper() for x in row.values if pd.notna(x)]
            if 'MAT' in row_vals and 'NOME' in row_vals:
                header_idx = i
                break

        if header_idx == -1:
            print("ERRO: Cabeçalho (MAT, NOME) não encontrado nas primeiras 50 linhas.")
            return

        # Carrega os dados reais
        df = xl.parse(sheet_name, header=header_idx)
        df.columns = [str(c).strip().upper() for c in df.columns]
        
        # Filtra linhas sem nome (provavelmente o final da tabela ou linhas vazias)
        df = df[df['NOME'].notna() & (df['NOME'] != '')]
        
        total_colaboradores = len(df)
        
        # Colunas de Liberação (conforme api.ts)
        # No Excel podem ter nomes ligeiramente diferentes, mas o parse do pandas deve ter pegado RH, SAÚDE, SEGURANÇA, GRD
        rh_col = 'RH'
        saude_col = 'SAÚDE'
        seg_col = 'SEGURANÇA'
        grd_cols = [c for c in df.columns if 'GRD' in c]
        grd_col = grd_cols[0] if grd_cols else None
        adm_col = 'DATA ADMISSÃO'

        def is_ok(val):
            return str(val).strip().upper() == 'OK'

        if all(c in df.columns for c in [rh_col, saude_col, seg_col]) and grd_col:
            liberados = df[
                (df[rh_col].apply(is_ok)) & 
                (df[saude_col].apply(is_ok)) & 
                (df[seg_col].apply(is_ok)) & 
                (df[grd_col].apply(is_ok))
            ].shape[0]
            
            pendentes = total_colaboradores - liberados
            
            # Contagem com Data de Admissão
            com_adm = df[df[adm_col].notna()].shape[0]
            
            print(f"--- RELATÓRIO DE AUDITORIA (PLANILHA) ---")
            print(f"Total de Colaboradores Detectados: {total_colaboradores}")
            print(f"Liberados (Total OK): {liberados}")
            print(f"Pendentes: {pendentes}")
            print(f"Total com 'DATA ADMISSÃO' preenchida: {com_adm}")
            
            # Mostrar os primeiros 5 para conferência
            print("\nPrimeiros 5 registros para conferência de nomes:")
            print(df[['MAT', 'NOME', 'STATUS']].head().to_string(index=False))
            
        else:
            missing = [c for c in [rh_col, saude_col, seg_col] if c not in df.columns]
            if not grd_col: missing.append('GRD')
            print(f"ERRO: Colunas obrigatórias não encontradas: {missing}")
            print(f"Colunas disponíveis: {df.columns.tolist()}")

    except Exception as e:
        print(f"ERRO DURANTE O PROCESSAMENTO: {str(e)}")

if __name__ == '__main__':
    audit()
