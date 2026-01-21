# 🚀 G68: SEMBRADOR DE HISTORIAL PROFUNDO (6 Meses de Time-Travel)
# =============================================================
# REQUISITO: Ejecutar como ADMINISTRADOR en PowerShell.
# Este script poblará tu Dashboard con datos históricos reales.

$currentDate = Get-Date
$phrases = @(
    "Excelente servicio y atención impecable", 
    "El hotel estaba sucio y olía a cloaca, fatal", 
    "Una experiencia aceptable, el wifi funcionaba bien",
    "Estafa total, la habitación no existía al llegar",
    "Muy cómodo y bien ubicado, volvería sin duda",
    "Atención de mierda, el personal fue grosero",
    "Todo bien, lo esperado para el precio",
    "Increíble vista, pero el cuarto era diminuto",
    "Pretencioso y caro para la calidad que ofrecen",
    "Limpieza perfecta y staff muy amable"
)

Write-Host "🕒 Iniciando simulación de historial de 6 meses..." -ForegroundColor Cyan
Write-Host "⚠️ ATENCIÓN: Tu reloj cambiará temporalmente. No cierres el script." -ForegroundColor Red

# Iterar los últimos 6 meses
for ($m = 5; $m -ge 0; $m--) {
    # Días clave para mostrar tendencia (5, 15, 25 de cada mes)
    $diasClave = @(5, 15, 25)
    
    foreach ($dia in $diasClave) {
        # Crear la fecha objetivo
        $targetDate = (Get-Date -Year $currentDate.Year -Month $currentDate.Month -Day 1).AddMonths(-$m).AddDays($dia - 1)
        
        # Validar que no sea una fecha futura
        if ($targetDate -gt $currentDate) { continue }

        Write-Host "📅 Generando datos para el: $($targetDate.ToString('dd/MM/yyyy'))" -ForegroundColor Yellow
        
        # ⏱️ Cambiar reloj del sistema
        Set-Date $targetDate
        
        # 📤 Enviar 3-5 mensajes aleatorios para este día
        $cantidad = Get-Random -Minimum 3 -Maximum 6
        for ($k = 0; $k -lt $cantidad; $k++) {
            $msg = $phrases | Get-Random
            try {
                Invoke-RestMethod -Uri "http://localhost:8000/sentiment" `
                                  -Method Post `
                                  -ContentType "application/json" `
                                  -Body (@{text=$msg} | ConvertTo-Json) -ErrorAction Stop
                Write-Host "  ✅ OK: $msg" -ForegroundColor Gray
            } catch {
                Write-Host "  ❌ Error: Backend no disponible. ¿Está el server Java corriendo?" -ForegroundColor Red
                break
            }
        }
    }
}

# 🔄 Restaurar hora real
Set-Date $currentDate
Write-Host "`n✨ SIMULACIÓN COMPLETADA CON ÉXITO ✨" -ForegroundColor Green
Write-Host "✅ Hora del sistema restaurada: $(Get-Date)" -ForegroundColor Green
Write-Host "💡 Sugerencia: Refresca el Dashboard para ver las nuevas gráficas." -ForegroundColor Cyan
