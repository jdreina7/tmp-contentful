/**
 * Artillery Processor
 * Custom functions for Artillery load testing
 */

module.exports = {
  // Función para logging de requests
  logRequest: function (requestParams, context, ee, next) {
    console.log('Request:', requestParams.url);
    return next();
  },

  // Función para logging de respuestas
  logResponse: function (requestParams, response, context, ee, next) {
    console.log('Response status:', response.statusCode);
    if (response.statusCode === 429) {
      console.log('⚠️  Rate limit triggered!');
    }
    return next();
  },

  // Función para contar rate limits
  countRateLimits: function (requestParams, response, context, ee, next) {
    if (response.statusCode === 429) {
      if (!context.vars.rateLimitCount) {
        context.vars.rateLimitCount = 0;
      }
      context.vars.rateLimitCount++;
      ee.emit('counter', 'rate_limits', 1);
    }
    return next();
  },

  // Función para validar token JWT
  validateToken: function (requestParams, response, context, ee, next) {
    if (response.body && response.body.access_token) {
      console.log('✅ JWT Token obtained successfully');
      context.vars.hasValidToken = true;
    } else {
      console.log('❌ Failed to obtain JWT token');
      context.vars.hasValidToken = false;
    }
    return next();
  },

  // Función para generar delay aleatorio (simular usuarios reales)
  randomDelay: function (context, events, done) {
    const delay = Math.random() * 1000; // 0-1 segundo
    setTimeout(done, delay);
  },

  // Función para imprimir resumen al final
  printSummary: function (context, events, done) {
    console.log('\n📊 Test Summary:');
    console.log('Rate Limits triggered:', context.vars.rateLimitCount || 0);
    done();
  },
};
