/**
 * CI Validation Demo - Main JavaScript
 * Handles form validation, API calls, and UI interactions
 */

console.log("Script started loading...");

// SEO and Analytics tracking
function trackEvent(action, category = 'CI_Validation', label = '') {
  // Basic event tracking - can be extended with Google Analytics
  console.log(`Analytics Event: ${category} - ${action} - ${label}`);
  
  // If Google Analytics is loaded
  if (typeof gtag !== 'undefined') {
    gtag('event', action, {
      event_category: category,
      event_label: label,
      value: 1
    });
  }
  
  // Track page interactions for SEO
  if (action === 'validation_success') {
    // Update page metadata dynamically for better SEO
    document.title = `CI ${label} validada - Validador de Cédulas Uruguayas`;
  }
}

// Get API base URL based on environment
const API_BASE_URL = window.location.origin;
console.log("API_BASE_URL:", API_BASE_URL);

// DOM elements - will be initialized when DOM is ready
let ciForm, ciInput, validateBtn, clearBtn, resultsSection, friendlyResult, friendlyContent, jsonResponse, copyBtn;

// Initialize DOM elements
function initializeDOMElements() {
  ciForm = document.getElementById("ciForm");
  ciInput = document.getElementById("ci");
  validateBtn = document.getElementById("validateBtn");
  clearBtn = document.getElementById("clearBtn");
  resultsSection = document.getElementById("resultsSection");
  friendlyResult = document.getElementById("friendlyResult");
  friendlyContent = document.getElementById("friendlyContent");
  jsonResponse = document.getElementById("jsonResponse");
  copyBtn = document.getElementById("copyBtn");

  console.log("DOM elements loaded:", {
    ciForm: !!ciForm,
    ciInput: !!ciInput,
    validateBtn: !!validateBtn,
    clearBtn: !!clearBtn,
    resultsSection: !!resultsSection,
    friendlyResult: !!friendlyResult,
    friendlyContent: !!friendlyContent,
    jsonResponse: !!jsonResponse,
    copyBtn: !!copyBtn,
  });
}

// Helper function to get service icon and color
function getServiceIcon(serviceName) {
  const icons = {
    'PuntosMas': { icon: 'fas fa-gift', color: 'text-yellow-400' },
    'Farmashop': { icon: 'fas fa-pills', color: 'text-green-400' },
    'Tata': { icon: 'fas fa-shopping-cart', color: 'text-blue-400' },
    'default': { icon: 'fas fa-store', color: 'text-gray-400' }
  };
  return icons[serviceName] || icons.default;
}

// Helper function to get status badge
function getStatusBadge(status) {
  const badges = {
    'available': { text: 'Disponible', color: 'bg-green-500', icon: 'fas fa-check' },
    'registered': { text: 'Registrado', color: 'bg-blue-500', icon: 'fas fa-user-check' },
    'needs_action': { text: 'Requiere Acción', color: 'bg-orange-500', icon: 'fas fa-exclamation-triangle' },
    'error': { text: 'Error', color: 'bg-red-500', icon: 'fas fa-times' },
    'inactive': { text: 'Inactivo', color: 'bg-gray-500', icon: 'fas fa-pause' }
  };
  return badges[status] || badges.error;
}

// Helper function to format contact options
function formatContactOptions(contactOptions) {
  if (!contactOptions || !Array.isArray(contactOptions)) return '';
  
  return contactOptions.map(contact => {
    const icon = contact.type === 'email' ? 'fas fa-envelope' : contact.type === 'mobile' ? 'fas fa-mobile-alt' : 'fas fa-phone';
    const label = contact.type === 'email' ? 'Email' : contact.type === 'mobile' ? 'Celular' : 'Teléfono';
    
    return `
      <div class="flex items-center text-xs text-white opacity-90 mt-1">
        <i class="${icon} mr-2"></i>
        <span><strong>${label}:</strong> ${contact.value}</span>
        ${contact.masked ? '<i class="fas fa-eye-slash ml-2 text-gray-400" title="Información enmascarada por privacidad"></i>' : ''}
      </div>
    `;
  }).join('');
}

// Helper function to format additional info
function formatAdditionalInfo(info) {
  if (typeof info === "string") {
    return info;
  }

  if (typeof info === "object" && info !== null) {
    // Handle simple data format (nombre, apellido, fechaNacimiento, etc.)
    if (info.nombre || info.apellido || info.fechaNacimiento) {
      let formatted = `<div class="persona-card">`;
      
      // Header with name and basic info
      if (info.nombre || info.apellido) {
        formatted += `
          <div class="flex items-center justify-between mb-4 gap-3 flex-wrap">
            <div>
              <h4 class="text-xl font-bold text-white">${info.nombre && info.apellido ? `${info.nombre} ${info.apellido}` : info.nombre || info.apellido}</h4>
              ${info.tipoDocumento ? `<p class="text-sm text-white opacity-75">${info.tipoDocumento}</p>` : ""}
              ${info.paisEmisor ? `<p class="text-sm text-white opacity-75">${info.paisEmisor}</p>` : ""}
            </div>
            <div class="text-right">
              ${info.cedula ? `<div class="info-badge"><i class="fas fa-id-card mr-1"></i>${info.cedula}</div>` : ""}
            </div>
          </div>
        `;
      }

      // Basic Information Grid
      formatted += `<div class="grid md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">`;

      // Birth Date
      if (info.fechaNacimiento) {
        formatted += `
          <div class="stat-item">
            <div class="text-2xl text-white mb-1">
              <i class="fas fa-birthday-cake text-yellow-400"></i>
            </div>
            <div class="text-white text-sm font-semibold">
              Fecha de Nacimiento
            </div>
            <div class="text-xs text-white opacity-75 mt-1">${info.fechaNacimiento}</div>
          </div>
        `;
      }

      // Document Type
      if (info.tipoDocumento) {
        formatted += `
          <div class="stat-item">
            <div class="text-2xl text-white mb-1">
              <i class="fas fa-id-card text-blue-400"></i>
            </div>
            <div class="text-white text-sm font-semibold">
              ${info.tipoDocumento}
            </div>
            ${info.paisEmisor ? `<div class="text-xs text-white opacity-75 mt-1">${info.paisEmisor}</div>` : ""}
          </div>
        `;
      }

      // Processing Time
      if (info.processingTime) {
        formatted += `
          <div class="stat-item">
            <div class="text-2xl text-white mb-1">
              <i class="fas fa-stopwatch text-orange-400"></i>
            </div>
            <div class="text-white text-sm font-semibold">
              ${info.processingTime}ms
            </div>
            <div class="text-xs text-white opacity-75 mt-1">Tiempo de consulta</div>
          </div>
        `;
      }

      formatted += `</div>`;

      // Name components if available
      if (info.primerNombre || info.primerApellido) {
        formatted += `
          <div class="mt-4 p-3 bg-white bg-opacity-10 rounded-lg">
            <h5 class="text-white font-semibold mb-2"><i class="fas fa-user-tag mr-2"></i>Componentes del Nombre</h5>
            <div class="flex flex-wrap gap-2">
              ${info.primerNombre ? `<span class="info-badge"><i class="fas fa-star mr-1"></i>Primer nombre: ${info.primerNombre}</span>` : ""}
              ${info.segundoNombre ? `<span class="info-badge"><i class="fas fa-plus mr-1"></i>Segundo nombre: ${info.segundoNombre}</span>` : ""}
              ${info.primerApellido ? `<span class="info-badge"><i class="fas fa-star mr-1"></i>Primer apellido: ${info.primerApellido}</span>` : ""}
              ${info.segundoApellido ? `<span class="info-badge"><i class="fas fa-plus mr-1"></i>Segundo apellido: ${info.segundoApellido}</span>` : ""}
            </div>
          </div>
        `;
      }

      // Session information
      if (info.hasSession !== undefined) {
        formatted += `
          <div class="mt-4 p-3 bg-white bg-opacity-10 rounded-lg">
            <h5 class="text-white font-semibold mb-2"><i class="fas fa-server mr-2"></i>Estado de la Sesión</h5>
            <div class="flex items-center">
              <i class="fas fa-${info.hasSession ? 'check' : 'times'} mr-2 ${info.hasSession ? 'text-green-400' : 'text-red-400'}"></i>
              <span class="text-white text-sm">${info.hasSession ? 'Sesión activa' : 'Sin sesión'}</span>
            </div>
          </div>
        `;
      }

      formatted += `</div>`;
      return formatted;
    }

    // Handle new service-based persona info
    if (info.persona && info.persona.services) {
      const persona = info.persona;
      console.log("Persona", persona);
      let formatted = `<div class="persona-card">`;

      // Personal Information Header FIRST
      if (persona.nombre || persona.apellido) {
        formatted += `
          <div class="flex items-center justify-between mb-6 gap-3 flex-wrap">
            <div>
              <h4 class="text-3xl font-bold text-white">${persona.nombreCompleto || `${persona.nombre || ''} ${persona.apellido || ''}`.trim()}</h4>
              ${persona.iniciales ? `<p class="text-lg text-white opacity-75">Iniciales: ${persona.iniciales}</p>` : ""}
            </div>
            <div class="text-right">
              ${persona.cedula ? `<div class="info-badge text-lg"><i class="fas fa-id-card mr-2"></i>${persona.cedula}</div>` : ""}
            </div>
          </div>
        `;

        // Personal Information Grid
        formatted += `<div class="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">`;

        // Age and Birth Date
        if (persona.edad !== undefined && persona.edad !== null || persona.fechaNacimiento !== undefined && persona.fechaNacimiento !== null) {
          formatted += `
            <div class="stat-item">
              <div class="text-3xl text-white mb-2">
                <i class="fas fa-birthday-cake text-yellow-400"></i>
              </div>
              <div class="text-white text-base font-semibold">
                ${persona.edad !== undefined && persona.edad !== null ? `${persona.edad} años` : "Fecha de Nacimiento"}
              </div>
              ${persona.fechaNacimiento !== undefined && persona.fechaNacimiento !== null ? `<div class="text-sm text-white opacity-75 mt-1">${persona.fechaNacimiento}</div>` : ""}
            </div>
          `;
        }

        // Gender
        if (persona.genero) {
          const genderIcon = persona.genero.genero === "masculino" ? "mars" : persona.genero.genero === "femenino" ? "venus" : "genderless";
          const genderClass = persona.genero.genero === "masculino" ? "gender-male" : persona.genero.genero === "femenino" ? "gender-female" : "gender-unknown";
          const confidenceColor = persona.genero.confianza === "alta" ? "text-green-400" : persona.genero.confianza === "media" ? "text-yellow-400" : "text-gray-400";

          formatted += `
            <div class="stat-item">
              <div class="text-3xl text-white mb-2 flex items-center justify-center">
                <i class="fas fa-${genderIcon} ${genderClass}"></i>
              </div>
              <div class="text-white text-base font-semibold capitalize">
                ${persona.genero.genero}
              </div>
              <div class="text-sm ${confidenceColor} mt-1">
                Confianza: ${persona.genero.confianza}
              </div>
            </div>
          `;
        }

        // Generation
        if (persona.generacion) {
          const genIcon = persona.generacion === "Gen Z" ? "mobile-alt" : persona.generacion === "Millennial" ? "laptop" : persona.generacion === "Gen X" ? "tv" : "radio";

          formatted += `
            <div class="stat-item">
              <div class="text-3xl text-white mb-2">
                <i class="fas fa-${genIcon} text-purple-400"></i>
              </div>
              <div class="generation-badge">
                <i class="fas fa-users mr-1"></i>
                ${persona.generacion}
              </div>
            </div>
          `;
        }

        // Name Statistics
        if (persona.cantidadNombres !== undefined) {
          formatted += `
            <div class="stat-item">
              <div class="text-3xl text-white mb-2">
                <i class="fas fa-signature text-blue-400"></i>
              </div>
              <div class="text-white text-base font-semibold">
                ${persona.cantidadNombres} nombre${persona.cantidadNombres !== 1 ? "s" : ""}
              </div>
              ${persona.longitudNombre ? `<div class="text-sm text-white opacity-75 mt-1">${persona.longitudNombre} caracteres</div>` : ""}
            </div>
          `;
        }

        formatted += `</div>`;

        // Name details
        if (persona.genero && persona.genero.primerNombre) {
          formatted += `
            <div class="mb-6 p-4 bg-white bg-opacity-10 rounded-lg">
              <h5 class="text-white font-semibold mb-3"><i class="fas fa-user-tag mr-2"></i>Detalles del Nombre</h5>
              <div class="flex flex-wrap gap-2">
                ${persona.genero.primerNombre ? `<span class="info-badge"><i class="fas fa-star mr-1"></i>Primer nombre: ${persona.genero.primerNombre}</span>` : ""}
                ${persona.tieneSegundoNombre !== undefined ? `<span class="info-badge"><i class="fas fa-${persona.tieneSegundoNombre ? "check" : "times"} mr-1"></i>${persona.tieneSegundoNombre ? "Tiene" : "No tiene"} segundo nombre</span>` : ""}
              </div>
            </div>
          `;
        }
      }

      // Summary Header
      if (persona.summary) {
        formatted += `
          <div class="mb-6 p-4 bg-white bg-opacity-10 rounded-lg">
            <h4 class="text-xl font-bold text-white mb-3 flex items-center">
              <i class="fas fa-chart-pie mr-2 text-blue-300"></i>
              Resumen de Servicios
            </h4>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div class="stat-item text-center">
                <div class="text-2xl font-bold text-blue-300">${persona.summary.totalServices}</div>
                <div class="text-xs text-white opacity-75">Servicios Totales</div>
              </div>
              <div class="stat-item text-center">
                <div class="text-2xl font-bold text-green-300">${persona.summary.availableServices}</div>
                <div class="text-xs text-white opacity-75">Disponibles</div>
              </div>
              <div class="stat-item text-center">
                <div class="text-2xl font-bold text-yellow-300">${persona.summary.totalPoints || 0}</div>
                <div class="text-xs text-white opacity-75">Puntos Totales</div>
              </div>
              <div class="stat-item text-center">
                <div class="text-2xl font-bold ${persona.summary.hasRegistrations ? 'text-green-300' : 'text-gray-300'}">
                  <i class="fas fa-${persona.summary.hasRegistrations ? 'check' : 'times'}"></i>
                </div>
                <div class="text-xs text-white opacity-75">Registros</div>
              </div>
            </div>
          </div>
        `;
      }

      // Services Grid
      if (persona.services && Array.isArray(persona.services)) {
        formatted += `
          <div class="mb-4">
            <h5 class="text-white font-semibold mb-4 flex items-center">
              <i class="fas fa-store mr-2"></i>
              Servicios Asociados (${persona.services.length})
            </h5>
            <div class="grid gap-4">
        `;

        persona.services.forEach(service => {
          const serviceIcon = getServiceIcon(service.service);
          const statusBadge = getStatusBadge(service.status);
          
          formatted += `
            <div class="service-card p-4 bg-white bg-opacity-10 rounded-lg border-l-4 border-${statusBadge.color.replace('bg-', '')}">
              <div class="flex items-start justify-between mb-3">
                <div class="flex items-center">
                  <i class="${serviceIcon.icon} ${serviceIcon.color} text-xl mr-3"></i>
                  <div>
                    <h6 class="text-white font-semibold text-lg">${service.service}</h6>
                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs text-white ${statusBadge.color}">
                      <i class="${statusBadge.icon} mr-1"></i>
                      ${statusBadge.text}
                    </span>
                  </div>
                </div>
                ${service.points ? `
                  <div class="text-right">
                    <div class="text-xl font-bold text-yellow-300">${service.points}</div>
                    <div class="text-xs text-white opacity-75">puntos</div>
                  </div>
                ` : ''}
              </div>
              
              <div class="text-white text-sm mb-3">
                <i class="fas fa-info-circle mr-2 text-blue-300"></i>
                ${service.message || 'Sin información adicional'}
              </div>

              ${service.actionRequired ? `
                <div class="p-3 bg-orange-500 bg-opacity-20 rounded-lg mb-3">
                  <div class="flex items-center text-orange-200">
                    <i class="fas fa-exclamation-triangle mr-2"></i>
                    <span class="font-semibold">Acción Requerida:</span>
                  </div>
                  <p class="text-sm text-white mt-1">${service.actionRequired}</p>
                </div>
              ` : ''}

              ${service.contactOptions ? `
                <div class="mt-3 p-3 bg-white bg-opacity-5 rounded-lg">
                  <div class="text-white font-semibold text-sm mb-2">
                    <i class="fas fa-address-book mr-2"></i>
                    Información de Contacto:
                  </div>
                  ${formatContactOptions(service.contactOptions)}
                </div>
              ` : ''}
            </div>
          `;
        });

        formatted += `
            </div>
          </div>
        `;
      }

      formatted += `</div>`;
      return formatted;
    }

    // Handle legacy persona format (for backward compatibility)
    if (info.persona && (info.persona.nombre || info.persona.apellido || info.persona.fechaNacimiento)) {
      const persona = info.persona;
      console.log("Has persona", persona);
      let formatted = `<div class="persona-card">`;

      // Header with name and basic info
      if (persona.nombre || persona.apellido) {
        formatted += `
          <div class="flex items-center justify-between mb-4 gap-3 flex-wrap">
            <div>
              <h4 class="text-xl font-bold text-white">${persona.nombreCompleto || `${persona.nombre || ''} ${persona.apellido || ''}`.trim()}</h4>
              ${persona.iniciales ? `<p class="text-sm text-white opacity-75">Iniciales: ${persona.iniciales}</p>` : ""}
              ${persona.tipoDocumento ? `<p class="text-sm text-white opacity-75">${persona.tipoDocumento}</p>` : ""}
              ${persona.paisEmisor ? `<p class="text-sm text-white opacity-75">${persona.paisEmisor}</p>` : ""}
            </div>
            <div class="text-right">
              ${persona.cedula ? `<div class="info-badge"><i class="fas fa-id-card mr-1"></i>${persona.cedula}</div>` : ""}
            </div>
          </div>
        `;
      }

      // Personal Information Grid
      formatted += `<div class="grid md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">`;

      // Age and Birth Date
      if (persona.edad !== undefined && persona.edad !== null || persona.fechaNacimiento !== undefined && persona.fechaNacimiento !== null) {
        formatted += `
          <div class="stat-item">
            <div class="text-2xl text-white mb-1">
              <i class="fas fa-birthday-cake text-yellow-400"></i>
            </div>
            <div class="text-white text-sm font-semibold">
              ${persona.edad !== undefined && persona.edad !== null ? `${persona.edad} años` : "Fecha de Nacimiento"}
            </div>
            ${persona.fechaNacimiento !== undefined && persona.fechaNacimiento !== null ? `<div class="text-xs text-white opacity-75 mt-1">${persona.fechaNacimiento}</div>` : ""}
          </div>
        `;
      }

      // Document Type
      if (persona.tipoDocumento) {
        formatted += `
          <div class="stat-item">
            <div class="text-2xl text-white mb-1">
              <i class="fas fa-id-card text-purple-400"></i>
            </div>
            <div class="text-white text-sm font-semibold">
              ${persona.tipoDocumento}
            </div>
            ${persona.paisEmisor ? `<div class="text-xs text-white opacity-75 mt-1">${persona.paisEmisor}</div>` : ""}
          </div>
        `;
      }

      // Processing Time
      if (persona.processingTime) {
        formatted += `
          <div class="stat-item">
            <div class="text-2xl text-white mb-1">
              <i class="fas fa-stopwatch text-orange-400"></i>
            </div>
            <div class="text-white text-sm font-semibold">
              ${persona.processingTime}ms
            </div>
            <div class="text-xs text-white opacity-75 mt-1">Tiempo de consulta</div>
          </div>
        `;
      }

      // Gender
      if (persona.genero) {
        const genderIcon = persona.genero.genero === "masculino" ? "mars" : persona.genero.genero === "femenino" ? "venus" : "genderless";
        const genderClass = persona.genero.genero === "masculino" ? "gender-male" : persona.genero.genero === "femenino" ? "gender-female" : "gender-unknown";
        const confidenceColor = persona.genero.confianza === "alta" ? "text-green-400" : persona.genero.confianza === "media" ? "text-yellow-400" : "text-gray-400";

        formatted += `
          <div class="stat-item">
            <div class="text-2xl text-white mb-1 flex items-center justify-center">
              <span class="${genderClass} gender-indicator"></span>
              <i class="fas fa-${genderIcon} ml-1"></i>
            </div>
            <div class="text-white text-sm font-semibold capitalize">
              ${persona.genero.genero}
            </div>
            <div class="text-xs ${confidenceColor} mt-1">
              Confianza: ${persona.genero.confianza}
            </div>
          </div>
        `;
      }

      // Generation
      if (persona.generacion) {
        const genIcon = persona.generacion === "Gen Z" ? "mobile-alt" : persona.generacion === "Millennial" ? "laptop" : persona.generacion === "Gen X" ? "tv" : "radio";

        formatted += `
          <div class="stat-item">
            <div class="text-2xl text-white mb-1">
              <i class="fas fa-${genIcon} text-purple-400"></i>
            </div>
            <div class="generation-badge">
              <i class="fas fa-users"></i>
              ${persona.generacion}
            </div>
          </div>
        `;
      }

      // Name Statistics
      if (persona.cantidadNombres !== undefined) {
        formatted += `
          <div class="stat-item">
            <div class="text-2xl text-white mb-1">
              <i class="fas fa-signature text-blue-400"></i>
            </div>
            <div class="text-white text-sm font-semibold">
              ${persona.cantidadNombres} nombre${persona.cantidadNombres !== 1 ? "s" : ""}
            </div>
            ${persona.longitudNombre ? `<div class="text-xs text-white opacity-75 mt-1">${persona.longitudNombre} caracteres</div>` : ""}
          </div>
        `;
      }

      formatted += `</div>`;

      // Name components if available
      if (persona.primerNombre || persona.primerApellido) {
        formatted += `
          <div class="mt-4 p-3 bg-white bg-opacity-10 rounded-lg">
            <h5 class="text-white font-semibold mb-2"><i class="fas fa-user-tag mr-2"></i>Componentes del Nombre</h5>
            <div class="flex flex-wrap gap-2">
              ${persona.primerNombre ? `<span class="info-badge"><i class="fas fa-star mr-1"></i>Primer nombre: ${persona.primerNombre}</span>` : ""}
              ${persona.segundoNombre ? `<span class="info-badge"><i class="fas fa-plus mr-1"></i>Segundo nombre: ${persona.segundoNombre}</span>` : ""}
              ${persona.primerApellido ? `<span class="info-badge"><i class="fas fa-star mr-1"></i>Primer apellido: ${persona.primerApellido}</span>` : ""}
              ${persona.segundoApellido ? `<span class="info-badge"><i class="fas fa-plus mr-1"></i>Segundo apellido: ${persona.segundoApellido}</span>` : ""}
            </div>
          </div>
        `;
      }

      // Additional Name Details
      if (persona.genero && (persona.genero.primerNombre || persona.genero.segundoNombre)) {
        formatted += `
          <div class="mt-4 p-3 bg-white bg-opacity-10 rounded-lg">
            <h5 class="text-white font-semibold mb-2"><i class="fas fa-user-tag mr-2"></i>Análisis de Nombres</h5>
            <div class="flex flex-wrap gap-2">
              ${persona.genero.primerNombre ? `<span class="info-badge"><i class="fas fa-star mr-1"></i>Primer nombre: ${persona.genero.primerNombre}</span>` : ""}
              ${persona.genero.segundoNombre ? `<span class="info-badge"><i class="fas fa-plus mr-1"></i>Segundo nombre: ${persona.genero.segundoNombre}</span>` : ""}
              ${persona.tieneSegundoNombre !== undefined ? `<span class="info-badge"><i class="fas fa-${persona.tieneSegundoNombre ? "check" : "times"} mr-1"></i>${persona.tieneSegundoNombre ? "Tiene" : "No tiene"} segundo nombre</span>` : ""}
            </div>
          </div>
        `;
      }

      // Session information
      if (persona.hasSession !== undefined) {
        formatted += `
          <div class="mt-4 p-3 bg-white bg-opacity-10 rounded-lg">
            <h5 class="text-white font-semibold mb-2"><i class="fas fa-server mr-2"></i>Estado de la Sesión</h5>
            <div class="flex items-center">
              <i class="fas fa-${persona.hasSession ? 'check' : 'times'} mr-2 ${persona.hasSession ? 'text-green-400' : 'text-red-400'}"></i>
              <span class="text-white text-sm">${persona.hasSession ? 'Sesión activa' : 'Sin sesión'}</span>
            </div>
          </div>
        `;
      }

      formatted += `</div>`;
      return formatted;
    }

    // Status and Message
    if (info.status !== undefined || info.message) {
      let formatted = `
        <div class="mt-4 p-3 bg-white bg-opacity-10 rounded-lg">
          <h5 class="text-white font-semibold mb-2"><i class="fas fa-info-circle mr-2"></i>Estado de la Consulta</h5>
          ${info.status !== undefined ? `<p class="text-sm text-white"><strong>Estado:</strong> <span class="info-badge">${info.status === 200 ? "✅ Consulta exitosa" : `❌ Error: ${info.status}`}</span></p>` : ""}
          ${info.message ? `<p class="text-sm text-white mt-1"><strong>Mensaje:</strong> ${info.message}</p>` : ""}
        </div>
      `;
      return formatted;
    }

    // Generic object display
    return `<pre class="text-xs bg-black bg-opacity-30 p-2 rounded mt-1 overflow-x-auto">${JSON.stringify(info, null, 2)}</pre>`;
  }

  return String(info);
}

// Update URL with CI parameter
function updateURL(ci) {
  const url = new URL(window.location);
  if (ci) {
    url.searchParams.set("ci", ci);
  } else {
    url.searchParams.delete("ci");
  }
  window.history.replaceState(null, "", url);
}

// Fill example CI and validate immediately
function fillExampleAndValidate(ci) {
  console.log("fillExampleAndValidate called with:", ci);
  if (ciInput) {
    ciInput.value = ci;
    updateURL(ci);
    validateCI();
  }
}

// Generate random valid CI
function generateRandomCI() {
  console.log("generateRandomCI called");
  const randomCi = generateValidRandomCI();
  console.log("Generated random CI:", randomCi);
  if (ciInput) {
    ciInput.value = randomCi;
    updateURL(randomCi);
    validateCI();
  }
}

// Generate a random CI with valid format and check digit
function generateValidRandomCI() {
  // Generate random 7 digits for the CI base
  let ciBase = "";
  for (let i = 0; i < 7; i++) {
    ciBase += Math.floor(Math.random() * 10).toString();
  }

  // Calculate the check digit using the same algorithm as the validator
  const multipliers = [2, 9, 8, 7, 6, 3, 4];
  let sum = 0;

  for (let i = 0; i < 7; i++) {
    const digit = parseInt(ciBase[i], 10);
    sum += digit * multipliers[i];
  }

  const remainder = sum % 10;
  const checkDigit = remainder === 0 ? 0 : 10 - remainder;

  return ciBase + checkDigit.toString();
}

// Fill example CI (legacy function, keeping for compatibility)
function fillExample(ci) {
  if (ciInput) {
    ciInput.value = ci;
    updateURL(ci);
  }
}

// Main validation function
async function validateCI() {
  if (!ciInput) return;
  
  const ci = ciInput.value.trim();

  if (!ci) {
    showError("Por favor ingresa un número de cédula");
    trackEvent('validation_error', 'CI_Validation', 'empty_input');
    return;
  }

  if (ci.length < 7 || ci.length > 8) {
    showError("La cédula debe tener entre 7 y 8 dígitos");
    trackEvent('validation_error', 'CI_Validation', 'invalid_length');
    return;
  }

  // Track validation attempt
  trackEvent('validation_attempt', 'CI_Validation', ci);

  // Update URL
  updateURL(ci);

  // Show loading state
  showLoading();

  try {
    const response = await fetch(`${API_BASE_URL}/api/ci/validate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ci: ci }),
    });

    const data = await response.json();
    
    if (response.ok) {
      trackEvent('validation_success', 'CI_Validation', ci);
    } else {
      trackEvent('validation_failed', 'CI_Validation', ci);
    }
    
    showResults(data, response.ok);
  } catch (error) {
    console.error("Error:", error);
    trackEvent('api_error', 'CI_Validation', error.message);
    showError("Error de conexión con el servidor. Por favor intenta nuevamente.");
  }
}

// Show loading state
function showLoading() {
  if (validateBtn) {
    validateBtn.innerHTML = '<div class="loading mr-2"></div>Validando...';
    validateBtn.disabled = true;
  }
  if (resultsSection) {
    resultsSection.classList.add("hidden");
  }
}

// Show results
function showResults(data, isSuccess) {
  // Reset button
  if (validateBtn) {
    validateBtn.innerHTML = '<i class="fas fa-check-circle mr-2"></i>Validar Cédula';
    validateBtn.disabled = false;
  }

  // Show results section
  if (resultsSection) {
    resultsSection.classList.remove("hidden");
    resultsSection.classList.add("fade-in");
  }

  // Update JSON response
  if (jsonResponse) {
    jsonResponse.textContent = JSON.stringify(data, null, 2);
  }

  // Update friendly result
  updateFriendlyResult(data, isSuccess);
}

// Update user-friendly result
function updateFriendlyResult(data, isSuccess) {
  if (!friendlyResult || !friendlyContent) return;
  
  let content = "";
  let bgColor = "";

  if (data.success && data.data?.isValid) {
    bgColor = "success";
    friendlyResult.classList.add("pulse-success");
    content = `
      <div class="flex items-start mb-6">
        <i class="fas fa-check-circle text-3xl text-green-200 mr-4 mt-1 hidden md:block"></i>
        <div class="flex-grow">
          <h4 class="text-2xl font-bold mb-2">¡Cédula Válida! ✅</h4>
          <p class="text-lg opacity-90 mb-4">La cédula <strong>${data.data.ci}</strong> es válida según el algoritmo uruguayo y tiene formato correcto.</p>
          
          <!-- Person Information -->
          ${data.data.info ? formatAdditionalInfo(data.data.info) : ""}
          
          <!-- Validation Details -->
          <div class="mt-4 p-4 bg-white bg-opacity-10 rounded-lg">
            <h5 class="text-white font-semibold mb-3 flex items-center">
              <i class="fas fa-shield-check mr-2"></i>
              Detalles de Validación
            </h5>
            <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
              <div class="flex items-center">
                <i class="fas fa-id-card text-blue-300 mr-2"></i>
                <span><strong>Cédula original:</strong> ${data.data.ci}</span>
              </div>
              <div class="flex items-center">
                <i class="fas fa-edit text-purple-300 mr-2"></i>
                <span><strong>Normalizada:</strong> ${data.data.normalizedCi}</span>
              </div>
              <div class="flex items-center">
                <i class="fas fa-check-double text-green-300 mr-2"></i>
                <span><strong>Algoritmo:</strong> Uruguayo ✓</span>
              </div>
              <div class="flex items-center">
                <i class="fas fa-clock text-yellow-300 mr-2"></i>
                <span><strong>Validado:</strong> ${new Date().toLocaleString("es-UY")}</span>
              </div>
              ${data.executionTime ? `
                <div class="flex items-center">
                  <i class="fas fa-stopwatch text-orange-300 mr-2"></i>
                  <span><strong>Tiempo total:</strong> ${data.executionTime.total}ms</span>
                </div>
                <div class="flex items-center">
                  <i class="fas fa-search text-cyan-300 mr-2"></i>
                  <span><strong>Consulta:</strong> ${data.executionTime.query}ms</span>
                </div>
              ` : ''}
            </div>
            ${data.executionTime && data.executionTime.total > 2000 ? `
              <div class="mt-3 p-2 bg-yellow-500 bg-opacity-20 rounded-lg">
                <div class="flex items-center text-yellow-200 text-xs">
                  <i class="fas fa-info-circle mr-2"></i>
                  <span>La consulta tardó más de lo habitual debido a la carga del servidor oficial.</span>
                </div>
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  } else {
    bgColor = "error";
    friendlyResult.classList.add("pulse-error");
    content = `
      <div class="flex items-center mb-4">
        <i class="fas fa-times-circle text-2xl text-red-200 mr-3"></i>
        <div>
          <h4 class="text-lg font-semibold">Cédula Inválida</h4>
          <p class="text-sm opacity-90">${data.error || "La cédula no cumple con el formato uruguayo"}</p>
        </div>
      </div>
      <div class="text-sm">
        <strong>Código de error:</strong> ${data.code || "VALIDATION_ERROR"}
      </div>
      ${data.executionTime ? `
        <div class="mt-3 text-xs opacity-75">
          <i class="fas fa-clock mr-1"></i>
          Tiempo de respuesta: ${data.executionTime.total}ms
        </div>
      ` : ''}
    `;
  }

  friendlyContent.innerHTML = content;

  // Remove previous background classes and add new ones
  friendlyResult.className = friendlyResult.className.replace(/bg-gradient-to-r|from-green-500|to-green-600|bg-red-500/g, "");
  
  if (bgColor === "success") {
    friendlyResult.classList.add("bg-gradient-to-r", "from-green-500", "to-green-600");
  } else if (bgColor === "error") {
    friendlyResult.classList.add("bg-red-500");
  }

  // Remove animation classes after animation
  setTimeout(() => {
    friendlyResult.classList.remove("pulse-success", "pulse-error");
  }, 600);
}

// Show error message
function showError(message) {
  if (validateBtn) {
    validateBtn.innerHTML = '<i class="fas fa-check-circle mr-2"></i>Validar Cédula';
    validateBtn.disabled = false;
  }

  const errorData = {
    success: false,
    error: message,
    code: "CLIENT_ERROR",
    timestamp: new Date().toISOString(),
  };

  showResults(errorData, false);
}

// Initialize event listeners
function initializeEventListeners() {
  // Load CI from URL parameter on page load
  const urlParams = new URLSearchParams(window.location.search);
  const ciParam = urlParams.get("ci");
  if (ciParam && ciInput) {
    ciInput.value = ciParam;
    // Auto-validate if CI is in URL
    setTimeout(() => validateCI(), 500);
  }

  // Format CI input (only numbers)
  if (ciInput) {
    ciInput.addEventListener("input", function (e) {
      let value = e.target.value.replace(/\D/g, "");
      if (value.length > 8) {
        value = value.substring(0, 8);
      }
      e.target.value = value;
    });
  }

  // Form submission
  if (ciForm) {
    ciForm.addEventListener("submit", function (e) {
      e.preventDefault();
      validateCI();
    });
  }

  // Clear button
  if (clearBtn) {
    clearBtn.addEventListener("click", function () {
      if (ciInput) {
        ciInput.value = "";
        ciInput.focus();
      }
      if (resultsSection) {
        resultsSection.classList.add("hidden");
      }
      updateURL("");
    });
  }

  // Copy JSON button
  if (copyBtn) {
    copyBtn.addEventListener("click", function () {
      if (jsonResponse && navigator.clipboard) {
        navigator.clipboard.writeText(jsonResponse.textContent).then(function () {
          const originalText = copyBtn.innerHTML;
          copyBtn.innerHTML = '<i class="fas fa-check mr-2"></i>Copiado!';
          copyBtn.classList.add("bg-green-600");
          setTimeout(() => {
            copyBtn.innerHTML = originalText;
            copyBtn.classList.remove("bg-green-600");
          }, 2000);
        });
      }
    });
  }

  // Handle example buttons with onclick attributes
  const exampleButtons = document.querySelectorAll("button[onclick]");
  exampleButtons.forEach((button) => {
    const onclickAttr = button.getAttribute("onclick");
    button.removeAttribute("onclick"); // Remove inline onclick

    button.addEventListener("click", function (e) {
      e.preventDefault();
      console.log("Button clicked, executing:", onclickAttr);

      // Parse and execute the function call manually
      if (onclickAttr.includes("fillExampleAndValidate")) {
        if (onclickAttr.includes("19119365")) {
          console.log("Calling fillExampleAndValidate with 19119365");
          fillExampleAndValidate("19119365");
        } else if (onclickAttr.includes("generateValidRandomCI")) {
          console.log("Calling fillExampleAndValidate with random CI");
          const randomCI = generateValidRandomCI();
          console.log("Generated random CI:", randomCI);
          fillExampleAndValidate(randomCI);
        }
      }
    });
  });

  // Add keyboard shortcuts
  document.addEventListener("keydown", function (e) {
    if (e.ctrlKey && e.key === "Enter") {
      validateCI();
    }
    if (e.key === "Escape" && clearBtn) {
      clearBtn.click();
    }
  });

  // Add tooltips
  const tooltips = {
    ci: "Ingresa tu cédula sin puntos ni guiones. Ejemplo: 19119365",
    validateBtn: "Presiona Ctrl + Enter para validar rápidamente",
    clearBtn: "Presiona Escape para limpiar rápidamente",
  };

  Object.keys(tooltips).forEach((id) => {
    const element = document.getElementById(id);
    if (element) {
      element.title = tooltips[id];
    }
  });
}

// Main initialization function
function initialize() {
  console.log("Initializing CI Validation Demo...");
  initializeDOMElements();
  initializeEventListeners();
  
  // Make functions globally accessible for legacy support
  window.fillExampleAndValidate = fillExampleAndValidate;
  window.generateRandomCI = generateRandomCI;
  window.fillExample = fillExample;
  window.validateCI = validateCI;
  
  console.log("CI Validation Demo initialized successfully!");
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  // DOM is already ready
  initialize();
}
