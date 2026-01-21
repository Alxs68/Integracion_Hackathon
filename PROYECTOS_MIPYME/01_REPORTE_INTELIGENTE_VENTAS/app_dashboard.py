import streamlit as st
import sqlite3
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from datetime import datetime

# Configuración de la página
st.set_page_config(page_title="Dashboard MIPYME G68", layout="wide", page_icon="📊")

# Aplicar estilo personalizado para modo oscuro
st.markdown("""
    <style>
    .main {
        background-color: #0d1117;
    }
    .stMetric {
        background-color: #161b22;
        padding: 15px;
        border-radius: 10px;
        border: 1px solid #30363d;
    }
    </style>
    """, unsafe_allow_html=True)

import os

# 1. Cargar datos desde SQLite
@st.cache_data
def load_data():
    # Obtener la ruta del directorio donde está este script
    current_dir = os.path.dirname(os.path.abspath(__file__))
    db_path = os.path.join(current_dir, 'negocio_mipyme.db')
    
    conn = sqlite3.connect(db_path)
    query = """
    SELECT v.fecha, c.nombre as cliente, p.nombre as producto, 
           v.cantidad, v.precio_venta, v.total
    FROM ventas v
    JOIN clientes c ON v.cliente_id = c.id
    JOIN productos p ON v.producto_id = p.id
    """
    df = pd.read_sql_query(query, conn)
    conn.close()
    df['fecha'] = pd.to_datetime(df['fecha'])
    return df

try:
    df = load_data()

    # sidebar - Filtros
    st.sidebar.title("🛠️ Filtros")
    st.sidebar.markdown("Personaliza tu reporte")
    
    # Filtro de fecha
    min_date = df['fecha'].min().to_pydatetime()
    max_date = df['fecha'].max().to_pydatetime()
    
    date_range = st.sidebar.date_input(
        "Rango de Fechas",
        value=(min_date, max_date),
        min_value=min_date,
        max_value=max_date
    )

    # Filtrar datos si se seleccionó un rango
    if len(date_range) == 2:
        start_date, end_date = date_range
        mask = (df['fecha'].dt.date >= start_date) & (df['fecha'].dt.date <= end_date)
        df_filtered = df.loc[mask]
    else:
        df_filtered = df

    # --- HEADER ---
    st.title("📊 Análisis Estratégico MIPYME")
    st.markdown(f"Reporte generado para el periodo: **{date_range[0] if len(date_range)>0 else 'N/A'}** al **{date_range[1] if len(date_range)>1 else 'N/A'}**")
    st.divider()

    # --- KPIs PRINCIPALES ---
    col1, col2, col3, col4 = st.columns(4)
    
    total_ventas = df_filtered['total'].sum()
    ticket_promedio = df_filtered['total'].mean()
    unidades_vendidas = df_filtered['cantidad'].sum()
    total_clientes = df_filtered['cliente'].nunique()

    with col1:
        st.metric("Ventas Totales", f"${total_ventas:,.2f}")
    with col2:
        st.metric("Ticket Promedio", f"${ticket_promedio:,.2f}")
    with col3:
        st.metric("Unidades Vendidas", f"{unidades_vendidas:,} u.")
    with col4:
        st.metric("Clientes Activos", f"{total_clientes}")

    st.markdown("---")

    # --- GRÁFICOS ---
    c1, c2 = st.columns(2)

    with c1:
        st.subheader("🏆 Top Clientes (Ventas)")
        # Datos para el gráfico
        df_top = df_filtered.groupby('cliente')['total'].sum().sort_values(ascending=True).reset_index().tail(10)
        
        # Crear gráfico imitando el estilo estático final
        fig_clientes = px.bar(
            df_top,
            x='total', y='cliente', orientation='h',
            text='total',
            color='total',
            color_continuous_scale="magma",
            template="plotly_dark"
        )
        
        # Estética "Elite Dark" (limpieza de ejes y contraste)
        fig_clientes.update_traces(
            texttemplate='$%{text:,.0f}', 
            textposition='outside',
            marker_line_color='white',
            marker_line_width=0.5,
            width=0.6 # Grosor de barra similar al 0.6 estático
        )
        
        fig_clientes.update_layout(
            paper_bgcolor='#0d1117',
            plot_bgcolor='#0d1117',
            xaxis=dict(showgrid=False, zeroline=False, showticklabels=False, title=''),
            yaxis=dict(showgrid=False, title='', tickfont=dict(size=11, color='#f0f6fc', family="Arial Black")),
            font=dict(color='#f0f6fc'),
            margin=dict(l=150, r=50, t=20, b=20), # Más margen izquierdo para los nombres
            showlegend=False,
            height=450,
            coloraxis_showscale=False
        )
        st.plotly_chart(fig_clientes, use_container_width=True)

    with c2:
        st.subheader("📦 Distribución por Producto")
        df_prod = df_filtered.groupby('producto')['cantidad'].sum().reset_index()
        
        # Gráfico de Donut con alto contraste
        fig_prod = px.pie(
            df_prod,
            values='cantidad', names='producto',
            hole=0.5,
            template="plotly_dark",
            color_discrete_sequence=px.colors.sequential.Plasma_r
        )
        
        fig_prod.update_traces(
            textposition='inside', 
            textinfo='percent+label',
            marker=dict(line=dict(color='#0d1117', width=2))
        )
        
        fig_prod.update_layout(
            paper_bgcolor='#0d1117',
            plot_bgcolor='#0d1117',
            font=dict(color='#f0f6fc'),
            margin=dict(l=20, r=20, t=50, b=20),
            height=450,
            showlegend=False
        )
        st.plotly_chart(fig_prod, use_container_width=True)

    # --- TABLA DE DATOS ---
    with st.expander("📄 Ver detalles de la transacción (Datos Filtrados)"):
        st.dataframe(df_filtered.style.format({"precio_venta": "${:,.2f}", "total": "${:,.2f}"}), use_container_width=True)

except Exception as e:
    st.error(f"Error al cargar el dashboard: {e}")
    st.info("Asegúrate de haber ejecutado los scripts previos para generar la base de datos.")
