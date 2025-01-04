from graphviz import Digraph
import streamlit as st
import networkx as nx
import matplotlib.pyplot as plt
import json

# 初期化
if "graph" not in st.session_state:
    st.session_state.graph = nx.DiGraph()

st.title("Simple DAG Editor")

# ノード追加
st.sidebar.header("ノード操作")
node_name = st.sidebar.text_input("ノード名を入力", "")
node_image = st.sidebar.text_input("イメージ (image) を入力", "")
node_command = st.sidebar.text_input("コマンド (command) を入力", "")

if st.sidebar.button("ノードを追加"):
    if node_name:
        if node_name in st.session_state.graph.nodes:
            st.warning(f"ノード '{node_name}' は既に存在します。")
        else:
            # ノードにカスタム情報を追加
            st.session_state.graph.add_node(
                node_name, image=node_image, command=node_command
            )
            st.success(f"ノード '{node_name}' を追加しました！")
    else:
        st.warning("ノード名を入力してください。")

# ノード削除
if st.sidebar.button("ノードを削除"):
    if node_name in st.session_state.graph.nodes:
        st.session_state.graph.remove_node(node_name)
        st.success(f"ノード '{node_name}' を削除しました！")
    else:
        st.warning(f"ノード '{node_name}' は存在しません。")

# エッジ追加
st.sidebar.header("エッジ操作")
source = st.sidebar.selectbox("ソースノード", st.session_state.graph.nodes, key="source")
target = st.sidebar.selectbox("ターゲットノード", st.session_state.graph.nodes, key="target")
if st.sidebar.button("エッジを追加"):
    if source != target:
        st.session_state.graph.add_edge(source, target)
        st.success(f"エッジ '{source} -> {target}' を追加しました！")
    else:
        st.warning("ソースとターゲットを異なるノードにしてください。")

# エッジ削除
if st.sidebar.button("エッジを削除"):
    if st.session_state.graph.has_edge(source, target):
        st.session_state.graph.remove_edge(source, target)
        st.success(f"エッジ '{source} -> {target}' を削除しました！")
    else:
        st.warning(f"エッジ '{source} -> {target}' は存在しません。")


st.header("DAG Viewer")
if st.session_state.graph.nodes:

    dot = Digraph(format="svg")
    for node, data in st.session_state.graph.nodes(data=True):
        dot.node(node, f"{node}\nImage: {data.get('image', '')}\nCommand: {data.get('command', '')}")
    for source, target in st.session_state.graph.edges:
        dot.edge(source, target)
    
    st.graphviz_chart(dot.source)

else:
    st.info("ノードを追加してDAGを構築してください。")

# DAGのJSON出力
st.header("DAG JSON")
if st.session_state.graph.nodes:
    # DAGをJSON形式に変換
    dag_json = {
        "nodes": [
            {"id": node, "image": data.get("image", ""), "command": data.get("command", "")}
            for node, data in st.session_state.graph.nodes(data=True)
        ],
        "edges": [
            {"source": source, "target": target}
            for source, target in st.session_state.graph.edges
        ],
    }
    dag_json_str = json.dumps(dag_json, indent=4)
    st.code(dag_json_str, language="json")

    # JSONファイルのダウンロードリンクを提供
    st.download_button(
        label="DAGをJSONファイルとしてダウンロード",
        data=dag_json_str,
        file_name="dag.json",
        mime="application/json",
    )
else:
    st.info("ノードとエッジを追加してDAGを構築してください。")

# ノード・エッジのリセット
if st.button("DAGをリセット"):
    st.session_state.graph = nx.DiGraph()
    st.success("DAGをリセットしました。")
