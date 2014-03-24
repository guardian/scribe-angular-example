require.config({
  paths: {
    'angular': './bower_components/angular/angular',
    'lodash': './bower_components/lodash/dist/lodash',
    'scribe': './bower_components/scribe/scribe',
    'scribe-plugin-blockquote-command': './bower_components/scribe-plugin-blockquote-command/scribe-plugin-blockquote-command',
    'scribe-plugin-curly-quotes': './bower_components/scribe-plugin-curly-quotes/scribe-plugin-curly-quotes',
    'scribe-plugin-formatter-plain-text-convert-new-lines-to-html': './bower_components/scribe-plugin-formatter-plain-text-convert-new-lines-to-html/scribe-plugin-formatter-plain-text-convert-new-lines-to-html',
    'scribe-plugin-heading-command': './bower_components/scribe-plugin-heading-command/scribe-plugin-heading-command',
    'scribe-plugin-intelligent-unlink-command': './bower_components/scribe-plugin-intelligent-unlink-command/scribe-plugin-intelligent-unlink-command',
    'scribe-plugin-keyboard-shortcuts': './bower_components/scribe-plugin-keyboard-shortcuts/scribe-plugin-keyboard-shortcuts',
    'scribe-plugin-link-prompt-command': './bower_components/scribe-plugin-link-prompt-command/scribe-plugin-link-prompt-command',
    'scribe-plugin-sanitizer': './bower_components/scribe-plugin-sanitizer/scribe-plugin-sanitizer',
    'scribe-plugin-smart-lists': './bower_components/scribe-plugin-smart-lists/scribe-plugin-smart-lists',
    'scribe-plugin-toolbar': './bower_components/scribe-plugin-toolbar/scribe-plugin-toolbar'
  },
  shim: {
    'angular' : { exports: 'angular' }
  }
});

require([
  'angular',
  'scribe',
  'scribe-plugin-blockquote-command',
  'scribe-plugin-curly-quotes',
  'scribe-plugin-formatter-plain-text-convert-new-lines-to-html',
  'scribe-plugin-heading-command',
  'scribe-plugin-intelligent-unlink-command',
  'scribe-plugin-keyboard-shortcuts',
  'scribe-plugin-link-prompt-command',
  'scribe-plugin-sanitizer',
  'scribe-plugin-toolbar',
  'lodash'
], function(
  angular,
  Scribe,
  scribePluginBlockquoteCommand,
  scribePluginCurlyQuotes,
  scribePluginFormatterPlainTextConvertNewLinesToHtml,
  scribePluginHeadingCommand,
  scribePluginIntelligentUnlinkCommand,
  scribePluginKeyboardShortcuts,
  scribePluginLinkPromptCommand,
  scribePluginSanitizer,
  scribePluginToolbar,
  _
) {
  'use strict';

  var app = angular.module('myApp', []);

  angular.element().ready(function() {
    angular.resumeBootstrap([app.name]);
  });

  app.controller('ExampleCtrl', function ($scope) {
    $scope.exampleModel = '<p>Hello, World!</p>';
  });

  // FIXME: This won't work because it needs to be appended in the editor's
  // compile phase.
  // controlsDirectives.directive('uiRichTextEditorButton', function () {
  //     return {
  //         restrict: 'E',
  //         replace: true,
  //         transclude: true,
  //         scope: {
  //             commandName: '@'
  //         },
  //         template:
  //             '<button data-command-name type="button">' +
  //                 '<i class="i-rich-text i-rich-text-{{commandName}}-active"></i>' +
  //                 '<span class="hidden" ng:transclude></span>' +
  //             '</button>'
  //     };
  // });

  app.directive('uiRichTextEditor', function () {

    var commandsToToolbarButtonsMap = Object.freeze({
      bold: {
        name: 'Bold',
        shortcutKeys: [platformKey(), 'b']
      },
      italic: {
        name: 'Italic',
        shortcutKeys: [platformKey(), 'i']
      },
      strikeThrough: {
        name: 'Strike Through',
        shortcutKeys: ['alt', 'shift', 's']
      },
      removeFormat: {
        name: 'Remove Formatting',
        shortcutKeys: ['alt', 'shift', 'a']
      },
      linkPrompt: {
        name: 'Link',
        shortcutKeys: [platformKey(), 'k']
      },
      unlink: {
        name: 'Unlink',
        shortcutKeys: [platformKey(), 'shift', 'k']
      },
      insertUnorderedList: {
        name: 'Bulleted List',
        shortcutKeys: ['alt', 'shift', 'b']
      },
      insertOrderedList: {
        name: 'Numbered List',
        shortcutKeys: ['alt', 'shift', 'n']
      },
      blockquote: {
        name: 'Blockquote',
        shortcutKeys: ['alt', 'shift', 'q']
      },
      quote: {
        name: 'Quote',
        shortcutKeys: ['alt', 'shift', 'w']
      },
      h2: {
        name: 'H2',
        shortcutKeys: [platformKey(), '2']
      },
      undo: {
        name: 'Undo',
        shortcutKeys: [platformKey(), 'z']
      },
      redo: {
        name: 'Redo',
        shortcutKeys: [platformKey(), 'shift', 'z']
      }
    });

    var commandsToAllowedElementsMap = Object.freeze({
      code: {
        code: {}
      },
      bold: {
        strong: {},
        b: {}
      },
      italic: {
        em: {},
        i: {}
      },
      strikeThrough: {
        strike: {}
      },
      linkPrompt: {
        a: { href: true }
      },
      insertUnorderedList: {
        ul: {},
        li: {}
      },
      insertOrderedList: {
        ol: {},
        li: {}
      },
      // FIXME: Multiples?
      blockquote: {
        blockquote: {}
      },
      quote: {
        blockquote: { class: 'quoted' }
      },
      h2: {
        h2: {},
      }
    });

    var ctrlKey = function (event) { return event.metaKey || event.ctrlKey; };
    var commandsToKeyboardShortcutsMap = Object.freeze({
      bold: function (event) { return ctrlKey(event) && event.keyCode === 66; }, // b
      italic: function (event) { return ctrlKey(event) && event.keyCode === 73; }, // i
      strikeThrough: function (event) { return event.altKey && event.shiftKey && event.keyCode === 83; }, // s
      removeFormat: function (event) { return event.altKey && event.shiftKey && event.keyCode === 65; }, // a
      linkPrompt: function (event) { return ctrlKey(event) && ! event.shiftKey && event.keyCode === 75; }, // k
      unlink: function (event) { return ctrlKey(event) && event.shiftKey && event.keyCode === 75; }, // k,
      insertUnorderedList: function (event) { return event.altKey && event.shiftKey && event.keyCode === 66; }, // b
      insertOrderedList: function (event) { return event.altKey && event.shiftKey && event.keyCode === 78; }, // n
      blockquote: function (event) { return event.altKey && event.shiftKey && event.keyCode === 81; }, // q
      quote: function (event) { return event.altKey && event.shiftKey && event.keyCode === 87; }, // w
      h2: function (event) { return ctrlKey(event) && event.keyCode === 50; }, // 2
    });

    var allowedElementsDefaults = Object.freeze({
      br: {}
    });

    return {
      restrict: 'E',
      require: 'ngModel',
      template:
        '<ui-rich-text-editor-toolbar></ui-rich-text-editor-toolbar>' +
        '<div class="ui-rich-text-editor__input-container">' +
          '<div class="ui-rich-text-editor__placeholder"></div>' +
          // This should be a custom element, but because of a bug in
          // Firefox with `contenteditable` not working properly
          // on custom elements, we can't.
          // As per: http://jsbin.com/etepiPOn/1/edit?html,css,js,console,output
          '<div class="ui-rich-text-editor__input" contenteditable="true"></div>' +
        '</div>',
      controller: ['$rootScope', function ($scope) {
        // TODO: This could come from a service
        $scope.plugins = [];

        this.addPlugin = function (fn) {
          $scope.plugins.push(fn);
        };
      }],
      link: function (scope, element, attrs, ngModelCtrl) {
        var config = scope.$eval(attrs.uiConfig);

        /**
         * Generate the toolbar dynamically
         * FIXME: this should happen in the compile phase, but
         * because the configuration is `$eval`'d on the scope,
         * we can't! :-(
         */

         // TODO: Create angular.element.find utility function
        var toolbarElement = angular.element(element[0].querySelector('ui-rich-text-editor-toolbar'));
        var inputElement = angular.element(element[0].querySelector('.ui-rich-text-editor__input'));
        var placeholderElement = angular.element(element[0].querySelector('.ui-rich-text-editor__placeholder'));

        // Get the subset
        var toolbarElementsData = _(commandsToToolbarButtonsMap).pick(config.commands);

        var buttonElements = angular.element(document.createDocumentFragment());
        // Use `_.forEach` because it's an object
        _(toolbarElementsData).forEach(function (button, commandName) {
          var buttonElement = angular.element(
            // FIXME: This won't work because it needs to happen in the
            // compile phase.
            // '<ui-rich-text-editor-button command-name="' + commandName + '">' +
            //     button.name +
            // '</ui-rich-text-editor-button>'
            '<button data-command-name="' + commandName + '" type="button" tabindex="-1" ' +
              (button.shortcutKeys && 'title="' + button.name + ' (' + button.shortcutKeys.join('+') + ')">') +
              button.name +
            '</button>'
          );
          buttonElements.append(buttonElement);
        });
        toolbarElement.append(buttonElements);

        var scribeConfig = { allowBlockElements: config.paragraphs };

        var scribe = new Scribe(inputElement[0], scribeConfig);
        // Update the markup preview
        scribe.on('content-changed', function updateHTML() {
          document.querySelector('.scribe-html').textContent = scribe.getHTML();
        });

        /**
         * Allowed elements
         */

        // Get the subset
        var allowedElementsData = _(commandsToAllowedElementsMap).pick(config.commands);

        // Transform into a data structure the sanitizer plugin
        // can understand.
        // The default callback to `_.map` is `_.identity`
        var allowedElements = _(allowedElementsData).map().reduce(function (allowedElements, group) {
          return _.extend(allowedElements, group);
        }, {});

        _.defaults(allowedElements, allowedElementsDefaults);

        if (config.paragraphs) {
          allowedElements.p = {};
        }

        var keyboardShortcutsData = _(commandsToKeyboardShortcutsMap).pick(config.commands).value();

        scribe.use(scribePluginBlockquoteCommand());
        scribe.use(scribePluginHeadingCommand(2));
        scribe.use(scribePluginIntelligentUnlinkCommand());
        scribe.use(scribePluginLinkPromptCommand());
        scribe.use(scribePluginSanitizer({
          tags: allowedElements
        }));
        // Add other plugins, attached via the controller
        scope.plugins.forEach(function (loadPlugin) {
          scribe.use(loadPlugin);
        });
        scribe.use(scribePluginKeyboardShortcuts(keyboardShortcutsData));
        scribe.use(scribePluginFormatterPlainTextConvertNewLinesToHtml());

        // Propagate events from Scribe
        var nbspChar = '&nbsp;';
        var nbspCharRegExp = new RegExp(nbspChar, 'g');
        scribe.on('content-changed', function () {
          safeApply(scope, function () {
            var value = scribe.getContent().
              // Strip all non-breaking spaces
              replace(nbspCharRegExp, ' ').
              // Strip all empty paragraphs
              replace(/(<p>(\s|&nbsp;|<br>)*<\/p>)/g, '');
            ngModelCtrl.$setViewValue(value);
          });
        });

        // Model to view
        ngModelCtrl.$render = function () {
          if (ngModelCtrl.$viewValue) {
            scribe.setContent(ngModelCtrl.$viewValue);
          }
        };

        // Redefine what empty looks like
        ngModelCtrl.$isEmpty = function (value) {
          return ! value || scribe.allowsBlockElements() && value === '<p><br></p>';
        };

        // Max length validator
        // Stolen from `textInputType` used internally in Angular
        // TODO: Create a `contenteditable` directive for this?
        if (attrs.ngMaxlength) {
          var maxlength = Number(attrs.ngMaxlength);
          var maxLengthValidator = function (value) {
            if (value) {
              if (value.length > maxlength) {
                ngModelCtrl.$setValidity('maxlength', false);
                return;
              } else {
                ngModelCtrl.$setValidity('maxlength', true);
                return value;
              }
            } else {
              return;
            }
          };

          ngModelCtrl.$parsers.push(maxLengthValidator);
          ngModelCtrl.$formatters.push(maxLengthValidator);
        }

        /**
         * Placeholder
         *
         * Ideally this would be handled by the
         * `uiRichTextEditorInput` directive, but this would lead to
         * losing some flexibility in the `contenteditable`.
         */

        if (attrs.uiPlaceholder) {
          placeholderElement.text(attrs.uiPlaceholder);

          scope.$watch(function () {
            return ngModelCtrl.$isEmpty(ngModelCtrl.$viewValue);
          }, function (isEmpty) {
            placeholderElement.css('display', isEmpty ? 'block' : 'none');
          });
        }
      }
    };
  });

  app.directive('uiRichTextEditorToolbar', function () {
    return {
      restrict: 'E',
      require: '^uiRichTextEditor',
      link: function (scope, element, attrs, uiRichTextEditorCtrl) {
        uiRichTextEditorCtrl.addPlugin(scribePluginToolbar(element[0]));
      }
    };
  });

  return app;
});

function platformKey() {
  return navigator.platform.toUpperCase().indexOf('MAC') >= 0 ? '⌘' : 'ctrl';
}

function safeApply(scope, fn) {
  if (scope.$$phase || scope.$root.$$phase) {
    fn();
  } else {
    scope.$apply(function () {
      fn();
    });
  }
}
