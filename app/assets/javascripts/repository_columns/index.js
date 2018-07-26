(function() {
  'use strict';

  // @TODO refactor that eventually
  function initEditCoumnModal() {
    var modalID = '#manageRepositoryColumn';
    var colRadID = '#repository_column_data_type_repositorylistvalue';
    var tagsInputID = '[data-role="tagsinput"]';
    var formID = '[data-role="manage-repository-column-form"]';

    $('[data-action="edit"]').off('click').on('click', function() {
      var editUrl = $(this).closest('li').attr('data-edit-url');
      $.get(editUrl, function(data) {
        $(data.html).appendTo('body').promise().done(function() {
          $(modalID).modal('show').promise().done(function() {

            $(modalID).on('hidden.bs.modal', function () {
              // remove edit modal window
              $(modalID).remove();
              $('.modal-backdrop').remove();
            });

            _initTagInput();
            setTimeout(function() {
              $('#repository_column_name').focus();
            }, 500)

            if($(modalID).attr('data-edit-type') === 'RepositoryListValue') {
              var values = JSON.parse($(tagsInputID).attr('data-value'));
              $(colRadID).click().promise().done(function() {
                $.each(values, function(index, element) {
                  $(tagsInputID).tagsinput('add', element);
                });
              });
            }

            $('[data-action="save"]').on('click', function() {
              if($(colRadID).is(':checked')) {
                $('#list_items').val($(tagsInputID).val());
              }

              _processResponse($(formID), 'update', modalID);
            });
          });
        });
      }).fail(function(error) {
        HelperModule.flashAlertMsg(
          $('#locale_data').attr('data-LIB_REPCOL_NO_PERMISSIONS'),
          'danger');
      });
    });
  }

  function initDeleteColumnModal() {
    $('[data-action="destroy"]').off('click').on('click', function() {
      var element = $(this);
      var modal_html = $("#deleteRepositoryColumn");
      $.get(element.closest('li').attr('data-destroy-url'), function(data) {
        modal_html.find('.modal-body').html(data.html)
                                                .promise()
                                                .done(function() {
          modal_html.modal('show');
          _initSubmitAction(modal_html, $(modal_html.find('form')));
        });
      }).fail(function(error) {
        HelperModule.flashAlertMsg(
          $('#locale_data').attr('data-LIB_REPCOL_NO_PERMISSIONS'),
          'danger');
      });
    });
  }

  // @TODO refactor that eventually
  function initNewColumnModal() {
    var modalID = '#manageRepositoryColumn';
    $('[data-action="new-column-modal"]').off('click').on('click', function() {
      var modalUrl = $(this).attr('data-modal-url');
      $.get(modalUrl, function(data) {
        $(data.html).appendTo('body').promise().done(function() {
          $(modalID).modal('show').promise().done(function() {

            $(modalID).on('hidden.bs.modal', function () {
              // remove create new modal window
              $(modalID).remove();
              $('.modal-backdrop').remove();
            });

            _initTagInput();
            setTimeout(function() {
              $('#repository_column_name').focus();
            }, 500);

            $('[data-action="save"]').on('click', function() {
              var colRad = '#repository_column_data_type_repositorylistvalue';
              if($(colRad).is(':checked')) {
                $('#list_items')
                  .val($('[data-role="tagsinput"]').val());
              }
              var form = $('[data-role="manage-repository-column-form"]');
              _processResponse(form, 'create', modalID);
            });
          });
        });
      });
    });
  }

  /* *********************************
    Helper methods
  ********************************* */

  function _insertNewListItem(column) {
    // remove element if already persent
    $('[data-id="' + column.id + '"]').remove();
    var html = '<li class="list-group-item row" data-id="' + column.id + '" ';
    html += 'data-destroy-url="' + column.destroy_html_url + '"';
    html += 'data-edit-url="' + column.edit_url + '"><div class="col-xs-8">';
    html += '<span class="pull-left column-name">' + column.name + '</span>';
    html += '</div><div class="col-xs-4"><span class="controlls pull-right">';
    html += '<button class="btn btn-default" data-action="edit">';
    html += '<span class="fas fa-pencil-alt"></span>&nbsp;';
    html += $('#locale_data').attr('data-LIB_REPCOL_INDEX_EDITCOL') + '</button>&nbsp;';
    html += '<button class="btn btn-default delete-column" data-action="destroy">';
    html += '<span class="glyphicon glyphicon-trash"></span>&nbsp;';
    html += $('#locale_data').attr('data-LIB_REPCOL_INDEX_DELCOL') + '</button>&nbsp;';
    html += '</button></span></div></li>';
    $(html).insertBefore('.repository-columns-body ul li:first')
           .promise()
           .done(function() {
             initDeleteColumnModal();
             initEditCoumnModal();
             // remove create new modal window
             $('#manageRepositoryColumn').remove();
             $('.modal-backdrop').remove();
           });
    // remove 'no column' list item
    $('[data-attr="no-columns"]').remove();
  }

  function _replaceListItem(column) {
    $('.list-group-item[data-id="' + column.id + '"]')
      .find('span.pull-left').text(column.name);
  }

  function _initTagInput() {
    $('[name="repository_column[data_type]"]')
      .on('click', function() {
        var listValueId = 'repository_column_data_type_repositorylistvalue';
        if($(this).attr('id') === listValueId) {
          $('[data-role="tagsinput"]').tagsinput({
            maxChars: $('#const_data').attr('data-NAME_MAX_LENGTH'),
            trimValue: true
          });
          $('.bootstrap-tagsinput').show();
          $('[data-role="tagsimput-label"]').show();
        } else {
          $('.bootstrap-tagsinput').hide();
          $('[data-role="tagsimput-label"]').hide();
        }
    });
  }

  function _removeElementFromDom(column) {
    $('.list-group-item[data-id="' + column.id + '"]').remove();
    if($('.list-group-item').length === 0) {
      location.reload();
    }
  }

  function _initSubmitAction(modal, form) {
    modal.find('[data-action="delete"]').on('click', function() {
      form.submit();
      modal.modal('hide')
      animateSpinner();
      _processResponse(form, 'destroy');
    });
  }

  function _processResponse(form, action, modalID) {
    form.on('ajax:success', function(e, data) {
      switch(action) {
        case 'destroy':
          _removeElementFromDom(data);
          break;
        case 'create':
          _insertNewListItem(data);
          break;
        case 'update':
          _replaceListItem(data);
          break;
        default:
          location.reload();
      }
      HelperModule.flashAlertMsg(data.message, 'success');
      animateSpinner(null, false);
      if (modalID) {
        $(modalID).modal('hide');
      }
    }).on('ajax:error', function(e, xhr) {
      animateSpinner(null, false);
      if (modalID) {
        if(xhr.responseJSON.message.hasOwnProperty('repository_list_items')) {
          var message = xhr.responseJSON.message['repository_list_items'];
          $('.dnd-error').remove();
          $('#manageRepositoryColumn ').find('.bootstrap-tagsinput').after(
            "<i class='dnd-error'>" + message + "</i>"
          );
        } else {
          var field = { "name": xhr.responseJSON.message }
          $(form).renderFormErrors('repository_column', field, true, e);
        }
      } else {
        HelperModule.flashAlertMsg(xhr.responseJSON.message, 'danger');
      }
    });
    if (modalID) {
      form.submit();
    }
  }

  /* *********************************
    Initializers
  ********************************* */

  $(document).ready(function() {
    initEditCoumnModal();
    initDeleteColumnModal();
    initNewColumnModal();
  });
})();
