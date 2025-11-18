# 🎯 Artillery Load Testing - Rate Limiting

Esta guía explica cómo realizar pruebas de carga y verificar el rate limiting de la API usando Artillery.

## 📋 Requisitos Previos

1. La API debe estar corriendo en `http://localhost:3000`
2. Artillery está instalado como dependencia de desarrollo

## 🚀 Comandos Disponibles

### 1. Prueba de Carga Completa
Ejecuta un escenario completo con múltiples fases y endpoints:

```bash
npm run test:load
```

**Qué hace:**
- Fase 1: Calentamiento (10 usuarios/seg × 10 seg)
- Fase 2: Carga normal (20 usuarios/seg × 20 seg)
- Fase 3: Pico de carga (50 usuarios/seg × 10 seg) ⚠️ Activa rate limiting
- Fase 4: Carga extrema (100 usuarios/seg × 5 seg) 🔥 Supera el límite

**Endpoints probados:**
- Health Check
- Get All Products
- Auth + Reports (protegidos)
- Rate Limit específico
- Endpoints mixtos

### 2. Prueba Específica de Rate Limiting
Prueba enfocada solo en verificar el rate limiting:

```bash
npm run test:load:rate-limit
```

**Qué hace:**
- Fase 1: 1 req/seg (bajo el límite) ✅
- Fase 2: 2 req/seg (en el límite) ⚠️
- Fase 3: 5 req/seg (sobre el límite) ❌
- Fase 4: 10 req/seg (muy por encima) 🚫

### 3. Prueba Rápida
Prueba rápida para verificar el funcionamiento básico:

```bash
npm run test:load:quick
```

**Qué hace:**
- Envía 100 requests en ráfagas de 10
- Útil para pruebas rápidas del rate limiting

### 4. Prueba con Reporte HTML
Genera un reporte visual en HTML:

```bash
npm run test:load:report
```

**Qué hace:**
- Ejecuta la prueba completa
- Genera `report.json` con los resultados
- Crea un reporte HTML interactivo
- Abre el reporte en tu navegador

## 📊 Entendiendo los Resultados

### Métricas Clave

**http.codes.200**: Requests exitosas (bajo el rate limit)
```
http.codes.200: ................................................................ 450
```

**http.codes.429**: Rate limit activado (Too Many Requests)
```
http.codes.429: ................................................................ 150
```

**http.request_rate**: Tasa de requests por segundo
```
http.request_rate: ............................................................. 45/sec
```

**http.response_time**: Tiempo de respuesta
```
http.response_time:
  min: ......................................................................... 5
  max: ......................................................................... 250
  mean: ........................................................................ 35
  median: ...................................................................... 30
  p95: ......................................................................... 80
  p99: ......................................................................... 120
```

### ¿Qué Significa Cada Código?

- **200 OK**: Request procesada exitosamente
- **429 Too Many Requests**: Rate limiting activado (100+ req/min)
- **401 Unauthorized**: Token JWT inválido o faltante
- **404 Not Found**: Endpoint no existe

## 🎯 Configuración de Rate Limiting

La API está configurada con:
- **Límite**: 100 requests por minuto
- **Por**: IP address
- **TTL**: 60 segundos
- **Scope**: Global (todos los endpoints)

### Cálculo del Límite

```
100 requests/minuto ÷ 60 segundos = ~1.67 requests/segundo
```

**Ejemplos:**
- ✅ 1 req/seg = 60 req/min → **Permitido**
- ⚠️ 2 req/seg = 120 req/min → **Rate Limit**
- ❌ 5 req/seg = 300 req/min → **Rate Limit**
- 🚫 10 req/seg = 600 req/min → **Rate Limit Extremo**

## 📝 Ejemplos de Salida

### Salida Exitosa (Bajo el Límite)
```
Summary report @ 12:34:56(+0000)
  Scenarios launched:  60
  Scenarios completed: 60
  Requests completed:  180
  Mean response/sec: 3
  Response time (msec):
    min: 5
    max: 45
    mean: 12
    median: 10
    p95: 25
    p99: 35
  Codes:
    200: 180
```

### Salida con Rate Limiting Activado
```
Summary report @ 12:34:56(+0000)
  Scenarios launched:  300
  Scenarios completed: 300
  Requests completed:  600
  Mean response/sec: 45
  Response time (msec):
    min: 5
    max: 150
    mean: 35
    median: 28
    p95: 85
    p99: 120
  Codes:
    200: 450
    429: 150  ⚠️ Rate limiting activado!
```

## 🔧 Personalización

### Modificar Archivos de Configuración

#### `artillery.yml` - Prueba Completa
Edita las fases para ajustar la carga:

```yaml
phases:
  - duration: 30      # Duración en segundos
    arrivalRate: 10   # Usuarios por segundo
    name: "Mi fase personalizada"
```

#### `artillery-rate-limit.yml` - Prueba Específica
Ajusta los escenarios de rate limiting:

```yaml
phases:
  - duration: 10
    arrivalRate: 2    # Cambiar para probar diferentes límites
    name: "Test personalizado"
```

### Variables de Entorno

Puedes cambiar el target en los archivos YAML:

```yaml
config:
  target: "http://localhost:3000"  # Cambiar a producción si es necesario
```

## 🐛 Troubleshooting

### Error: ECONNREFUSED
**Problema**: La API no está corriendo

**Solución**:
```bash
# En otra terminal, inicia la API
npm run start:dev
```

### Error: Too many open files
**Problema**: Sistema operativo limita conexiones simultáneas

**Solución (macOS/Linux)**:
```bash
ulimit -n 10000
```

### No se activa el Rate Limiting
**Problema**: La carga no es suficiente

**Solución**: Aumenta el `arrivalRate` en el archivo YAML:
```yaml
- duration: 10
  arrivalRate: 100  # Aumentar este número
```

## 📈 Mejores Prácticas

1. **Comienza con pruebas pequeñas**: Usa `test:load:quick` primero
2. **Incrementa gradualmente**: Aumenta la carga progresivamente
3. **Monitorea recursos**: Observa CPU y memoria durante las pruebas
4. **Prueba en etapas**: No saltes directamente a carga extrema
5. **Genera reportes**: Usa `test:load:report` para análisis detallado

## 📚 Recursos Adicionales

- [Documentación de Artillery](https://www.artillery.io/docs)
- [Rate Limiting en NestJS](https://docs.nestjs.com/security/rate-limiting)
- [Interpretando Métricas de Performance](https://www.artillery.io/docs/guides/guides/test-script-reference)

## 🎓 Ejemplos de Uso

### Prueba Básica
```bash
# 1. Inicia la API
npm run start:dev

# 2. En otra terminal, ejecuta Artillery
npm run test:load:rate-limit

# 3. Observa los códigos 429 (rate limiting activado)
```

### Prueba con Reporte Visual
```bash
# 1. Inicia la API
npm run start:dev

# 2. Ejecuta prueba con reporte
npm run test:load:report

# 3. Se abrirá un reporte HTML en tu navegador
```

### Prueba Personalizada
```bash
# Ejecuta Artillery directamente con opciones personalizadas
npx artillery run artillery.yml --target http://localhost:3000 --variables '{"apiKey":"tu-api-key"}'
```

---

## ✅ Checklist de Pruebas

Antes de finalizar las pruebas, verifica:

- [ ] Rate limiting se activa con > 100 req/min
- [ ] Código 429 se devuelve correctamente
- [ ] Endpoints públicos funcionan bajo carga
- [ ] Endpoints protegidos requieren JWT
- [ ] Autenticación funciona bajo carga
- [ ] No hay errores 500 (server errors)
- [ ] Tiempos de respuesta son aceptables
- [ ] El servidor no se cae con carga extrema

---

**Happy Load Testing! 🚀**
