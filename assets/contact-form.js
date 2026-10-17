(function () {
  'use strict';
  var endpoint = 'https://script.google.com/macros/s/AKfycbwa0VaJi0lyXBuar0eToCJswqamdV7FQXIpG-fsNFx7dayQ7Dnlq8CvYOz2Lg20OrA4ew/exec';
  var forms = document.querySelectorAll('[data-contact-form]');
  var choices = document.querySelectorAll('input[name="tipo-formulario"]');
  var openButton = document.getElementById('abrir_popup');
  var closeButton = document.getElementById('fechar_popup');
  var backdrop = document.getElementById('fundo');
  var dialog = backdrop && backdrop.querySelector('[role="dialog"]');
  var previousFocus = null;
  function closePopup() {
    if (!backdrop || backdrop.hidden) return;
    backdrop.hidden = true;
    backdrop.classList.remove('is-open');
    document.body.classList.remove('popup-aberto');
    if (previousFocus) previousFocus.focus();
  }
  if (openButton && closeButton && backdrop && dialog) {
    openButton.addEventListener('click', function () {
      previousFocus = document.activeElement;
      backdrop.hidden = false;
      backdrop.classList.add('is-open');
      document.body.classList.add('popup-aberto');
      closeButton.focus();
    });
    closeButton.addEventListener('click', closePopup);
    backdrop.addEventListener('click', function (event) {
      if (event.target === backdrop) closePopup();
    });
    document.addEventListener('keydown', function (event) {
      if (backdrop.hidden) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        closePopup();
        return;
      }
      if (event.key === 'Tab') {
        var focusableNodes = dialog.querySelectorAll('button:not(:disabled), input:not([type="hidden"]):not(:disabled), textarea:not(:disabled), a[href], select:not(:disabled), [tabindex]:not([tabindex="-1"])');
        var focusable = Array.prototype.filter.call(focusableNodes, function (element) { return !element.closest('[hidden]'); });
        var first = focusable[0];
        var last = focusable[focusable.length - 1];
        if (!first || !last) return;
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault(); last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault(); first.focus();
        }
      }
    });
  }
  Array.prototype.forEach.call(choices, function (choice) {
    choice.addEventListener('change', function () {
      Array.prototype.forEach.call(choices, function (item) {
        item.closest('.opcao-formulario').classList.toggle('selecionada', item.checked);
      });
      Array.prototype.forEach.call(document.querySelectorAll('[data-form-panel]'), function (panel) {
        panel.hidden = panel.id !== choice.getAttribute('aria-controls');
      });
    });
  });
  function setStatus(form, message, isError) {
    var status = form.querySelector('[data-form-status]');
    status.textContent = message;
    status.classList.toggle('mensagem-formulario--erro', isError);
  }
  Array.prototype.forEach.call(forms, function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var button = form.querySelector('button[type="submit"]');
      button.disabled = true; setStatus(form, 'Enviando sua mensagem…', false);
      fetch(endpoint, { method: 'POST', mode: 'no-cors', body: new FormData(form) })
        .then(function () {
          form.reset(); setStatus(form, 'Mensagem enviada. Obrigado por entrar em contato.', false);
        })
        .catch(function () {
          setStatus(form, 'Não foi possível enviar agora. Tente novamente em alguns minutos.', true);
        })
        .then(function () { button.disabled = false; });
    });
  });
}());
