(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  (function(root, factory) {
    if (typeof define === 'function' && define.amd) {
      return define(['underscore', 'jquery', 'backbone', 'marionette'], function(_, $, Backbone, Marionette) {
        return factory(root, {}, _, $, Backbone, Marionette);
      });
    } else {
      return root.AutoComplete = factory(root, {}, root._, root.jQuery, root.Backbone, root.Backbone.Marionette);
    }
  })(this, function(root, AutoComplete, _, $, Backbone, Marionette) {
    AutoComplete.Collection = (function(_super) {
      __extends(Collection, _super);

      function Collection() {
        return Collection.__super__.constructor.apply(this, arguments);
      }


      /**
       * Setup remote collection
       * @param {(Array|Backbone.Model[])} models
       * @param {Object} options
       */

      Collection.prototype.initialize = function(models, options) {
        this.options = options;
        this.setDataset(options.data);
        return this._initializeListeners();
      };


      /**
       * Listen to relavent events
       */

      Collection.prototype._initializeListeners = function() {
        this.listenTo(this, 'find', this.fetchNewSuggestions);
        this.listenTo(this, 'select', this.select);
        this.listenTo(this, 'highlight:next', this.highlightNext);
        this.listenTo(this, 'highlight:previous', this.highlightPrevious);
        return this.listenTo(this, 'clear', this.reset);
      };


      /**
       * Save models passed into the constructor seperately to avoid
       * rendering the entire dataset
       * @param {(Array|Backbone.Model[])} dataset
       */

      Collection.prototype.setDataset = function(dataset) {
        return this.dataset = this.parse(dataset, false);
      };


      /**
       * Parse API response
       * @param  {Array} suggestions
       * @param  {Boolean} limit
       * @return {Object}
       */

      Collection.prototype.parse = function(suggestions, limit) {
        if (this.options.parseKey) {
          suggestions = this.getValue(suggestions, this.options.parseKey);
        }
        if (limit) {
          suggestions = _.take(suggestions, this.options.values.limit);
        }
        return _.map(suggestions, function(suggestion) {
          return _.extend(suggestion, {
            value: this.getValue(suggestion, this.options.valueKey)
          });
        }, this);
      };


      /**
       * Get the value from an object using a string
       * @param  {Object} obj
       * @param  {String} prop
       * @return {String}
       */

      Collection.prototype.getValue = function(obj, prop) {
        return _.reduce(prop.split('.'), function(segment, property) {
          return segment[property];
        }, obj);
      };


      /**
       * Get query parameters
       * @param {String} query
       * @return {Obect}
       */

      Collection.prototype.getParams = function(query) {
        var data;
        data = {};
        data[this.options.keys.query] = query;
        _.each(this.options.keys, function(value, key) {
          return data[value] != null ? data[value] : data[value] = this.options.values[key];
        }, this);
        return {
          data: data
        };
      };


      /**
       * Get suggestions based on the current input. Either query
       * the api or filter the dataset
       * @param {String} query
       */

      Collection.prototype.fetchNewSuggestions = function(query) {
        switch (this.options.type) {
          case 'remote':
            return this.fetch(_.extend({
              url: this.options.remote
            }, this.getParams(query)));
          case 'dataset':
            return this.filterDataSet(query);
          default:
            throw new Error('Unkown type passed');
        }
      };


      /**
       * Filter the dataset
       * @param {String} query
       */

      Collection.prototype.filterDataSet = function(query) {
        var matches;
        matches = [];
        _.each(this.dataset, function(suggestion) {
          if (matches.length >= this.options.values.limit) {
            return false;
          }
          if (this.matches(suggestion.value, query)) {
            return matches.push(suggestion);
          }
        }, this);
        return this.set(matches);
      };


      /**
       * Check to see if the query matches the suggestion
       * @param  {String} suggestion
       * @param  {String} query
       * @return {Boolean}
       */

      Collection.prototype.matches = function(suggestion, query) {
        suggestion = this.normalizeValue(suggestion);
        query = this.normalizeValue(query);
        return suggestion.indexOf(query) >= 0;
      };


      /**
       * Normalize string
       * @return {String}
       */

      Collection.prototype.normalizeValue = function(string) {
        if (string == null) {
          string = '';
        }
        return string.toLowerCase().replace(/^\s*/g, '').replace(/\s{2,}/g, ' ');
      };


      /**
       * Select first suggestion unless the suggestion list
       * has been navigated then select at the current index
       */

      Collection.prototype.select = function() {
        return this.trigger('selected', this.at(this.isStarted() ? this.index : 0));
      };


      /**
       * highlight previous item
       */

      Collection.prototype.highlightPrevious = function() {
        if (!(this.isFirst() || !this.isStarted())) {
          this.deHighlight(this.index);
          return this.highlight(this.index = this.index - 1);
        }
      };


      /**
       * highlight next item
       */

      Collection.prototype.highlightNext = function() {
        if (!this.isLast()) {
          if (this.isStarted()) {
            this.deHighlight(this.index);
          }
          return this.highlight(this.index = this.index + 1);
        }
      };


      /**
       * Check to see if the first suggestion is highlighted
       * @return {Boolean}
       */

      Collection.prototype.isFirst = function() {
        return this.index === 0;
      };


      /**
       * Check to see if the last suggestion is highlighted
       * @return {Boolean}
       */

      Collection.prototype.isLast = function() {
        return this.index + 1 === this.length;
      };


      /**
       * Check to see if we have navigated through the
       * suggestions list yet
       * @return {Boolean}
       */

      Collection.prototype.isStarted = function() {
        return this.index !== -1;
      };


      /**
       * Trigger highlight on suggestion
       * @param  {Number} index
       * @return {Backbone.Model}
       */

      Collection.prototype.highlight = function(index) {
        var model;
        model = this.at(index);
        return model.trigger('highlight', model);
      };


      /**
       * Trigger highliht removal on the model
       * @param  {Number} index
       * @return {Backbone.Model}
       */

      Collection.prototype.deHighlight = function(index) {
        var model;
        model = this.at(index);
        return model.trigger('highlight:remove', model);
      };


      /**
       * Reset suggestions
       */

      Collection.prototype.reset = function() {
        this.index = -1;
        return Collection.__super__.reset.apply(this, arguments);
      };

      return Collection;

    })(Backbone.Collection);
    AutoComplete.ChildView = (function(_super) {
      __extends(ChildView, _super);

      function ChildView() {
        return ChildView.__super__.constructor.apply(this, arguments);
      }


      /**
       * @type {String}
       */

      ChildView.prototype.tagName = 'li';


      /**
       * @type {String}
       */

      ChildView.prototype.className = 'ac-suggestion';


      /**
       * @type {String}
       */

      ChildView.prototype.template = _.template('<a href="#"><%= value %></a>');


      /**
       * @type {Object}
       */

      ChildView.prototype.events = {
        'click': 'select'
      };


      /**
       * @type {Object}
       */

      ChildView.prototype.modelEvents = {
        'highlight': 'highlight',
        'highlight:remove': 'removeHighlight'
      };


      /**
       * Make the element that relates the current model active.
       */

      ChildView.prototype.highlight = function() {
        return this.$el.addClass('active');
      };


      /**
       * Make the element that relates to the current model inactive.
       */

      ChildView.prototype.removeHighlight = function() {
        return this.$el.removeClass('active');
      };


      /**
       * Make the current model active so that the autocomplete behavior
       * can listen for this event and trigger its own selection event on the view.
       */

      ChildView.prototype.select = function(e) {
        e.preventDefault();
        return this.model.trigger('selected', this.model);
      };

      return ChildView;

    })(Marionette.ItemView);
    AutoComplete.CollectionView = (function(_super) {
      __extends(CollectionView, _super);

      function CollectionView() {
        return CollectionView.__super__.constructor.apply(this, arguments);
      }


      /**
       * @type {String}
       */

      CollectionView.prototype.tagName = 'ul';


      /**
       * @type {String}
       */

      CollectionView.prototype.className = 'ac-suggestions dropdown-menu';


      /**
       * @type {Object}
       */

      CollectionView.prototype.attributes = {
        style: 'max-width: 100%;'
      };


      /**
       * @type {Marionette.ItemView}
       */

      CollectionView.prototype.emptyView = Marionette.ItemView.extend({
        tagName: 'li',
        template: _.template('<a href="#">No suggestions available</a>')
      });

      return CollectionView;

    })(Marionette.CollectionView);
    AutoComplete.Behavior = (function(_super) {
      __extends(Behavior, _super);

      function Behavior() {
        return Behavior.__super__.constructor.apply(this, arguments);
      }


      /**
       * @type {Object}
       */

      Behavior.prototype.defaults = {
        containerTemplate: '<div class="ac-container dropdown"></div>',
        rateLimit: 100,
        minLength: 1,
        collection: {
          definition: AutoComplete.Collection,
          options: {
            type: 'remote',
            remote: null,
            data: [],
            parseKey: null,
            valueKey: 'value',
            keys: {
              query: 'query',
              limit: 'limit'
            },
            values: {
              query: null,
              limit: 10
            }
          }
        },
        collectionView: {
          definition: AutoComplete.CollectionView
        },
        childView: {
          definition: AutoComplete.ChildView
        }
      };


      /**
       * This is the event prefix that will be used to fire all events on.
       * @type {String}
       */

      Behavior.prototype.eventPrefix = 'autocomplete';


      /**
       * Map which code relates to what action.
       * @type {Object}
       */

      Behavior.prototype.actionKeysMap = {
        27: 'esc',
        37: 'left',
        39: 'right',
        13: 'enter',
        38: 'up',
        40: 'down'
      };


      /**
       * @type {Object}
       */

      Behavior.prototype.events = {
        'keyup @ui.autocomplete': 'onKeydown',
        'blur @ui.autocomplete': 'onBlur'
      };


      /**
       * Setup the AutoComplete options and suggestions collection.
       */

      Behavior.prototype.initialize = function(options) {
        this.options = $.extend(true, {}, this.defaults, options);
        this.suggestions = new this.options.collection.definition([], this.options.collection.options);
        this.updateSuggestions = _.throttle(this._updateSuggestions, this.options.rateLimit);
        return this._initializeListeners();
      };


      /**
       * Listen to relavent events
       */

      Behavior.prototype._initializeListeners = function() {
        this.listenTo(this.suggestions, 'all', this.relayCollectionEvent);
        this.listenTo(this, "" + this.eventPrefix + ":open", this.open);
        this.listenTo(this, "" + this.eventPrefix + ":close", this.close);
        this.listenTo(this, "" + this.eventPrefix + ":suggestions:highlight", this.fillSuggestion);
        return this.listenTo(this, "" + this.eventPrefix + ":suggestions:selected", this.completeSuggestion);
      };


      /**
       * Initialize AutoComplete once the view el has been populated
       */

      Behavior.prototype.onRender = function() {
        this._initializeAutoComplete();
        return this.setInputElementAttributes();
      };


      /**
       * Wrap the input element inside the `containerTemplate` and
       * then append `AutoComplete.CollectionView`
       */

      Behavior.prototype._initializeAutoComplete = function() {
        this.$autocomplete = this.view.ui.autocomplete;
        this.$autocomplete.wrap(this.options.containerTemplate);
        this.$container = this.$autocomplete.parent();
        this.collectionView = this.getCollectionView();
        return this.$container.append(this.collectionView.render().el);
      };


      /**
       * Setup Collection view
       * @return {AutoComplete.CollectionView}
       */

      Behavior.prototype.getCollectionView = function() {
        return new this.options.collectionView.definition({
          childView: this.options.childView.definition,
          collection: this.suggestions
        });
      };


      /**
       * Set input attributes
       */

      Behavior.prototype.setInputElementAttributes = function() {
        return this.$autocomplete.addClass('ac-input').attr({
          autocomplete: 'off',
          spellcheck: false,
          dir: 'auto'
        });
      };


      /**
       * Relay the collecction events
       * @param {String} name
       * @param {Array} args
       */

      Behavior.prototype.relayCollectionEvent = function(name, args) {
        return this.triggerShared("" + this.eventPrefix + ":suggestions:" + name, args);
      };


      /**
       * Trigger an event on this and view
       */

      Behavior.prototype.triggerShared = function() {
        var _ref;
        this.trigger.apply(this, arguments);
        return (_ref = this.view).trigger.apply(_ref, arguments);
      };


      /**
       * Handle keydown event
       * @param {jQuery.Event} $e
       */

      Behavior.prototype.onKeydown = function($e) {
        var key;
        key = $e.which || $e.keyCode;
        if (!(this.$autocomplete.val().length < this.options.minLength)) {
          if (this.actionKeysMap[key] != null) {
            return this.doAction(key, $e);
          } else {
            return this.updateSuggestions(this.$autocomplete.val());
          }
        }
      };


      /**
       * Handle blur event
       */

      Behavior.prototype.onBlur = function() {
        return setTimeout((function(_this) {
          return function() {
            if (_this.isOpen) {
              return _this.triggerShared("" + _this.eventPrefix + ":close", _this.$autocomplete.val());
            }
          };
        })(this), 250);
      };


      /**
       * Trigger action event based on keycode name.
       * @param {Number} keycode
       * @param {jQuery.Event} $e
       */

      Behavior.prototype.doAction = function(keycode, $e) {
        $e.preventDefault();
        $e.stopPropagation();
        if (!this.suggestions.isEmpty()) {
          switch (this.actionKeysMap[keycode]) {
            case 'right':
              if (this.isSelectionEnd($e)) {
                return this.suggestions.trigger('select');
              }
              break;
            case 'enter':
              return this.suggestions.trigger('select');
            case 'down':
              return this.suggestions.trigger('highlight:next');
            case 'up':
              return this.suggestions.trigger('highlight:previous');
            case 'esc':
              return this.trigger("" + this.eventPrefix + ":close");
          }
        }
      };


      /**
       * Update suggestions list, never directly call this use `@updateSuggestions`
       * which is a limit throttle alias.
       * @param {String} query
       */

      Behavior.prototype._updateSuggestions = function(query) {
        if (!this.isOpen) {
          this.triggerShared("" + this.eventPrefix + ":open");
        }
        return this.suggestions.trigger('find', query);
      };


      /**
       * Check to see if the cursor is at the end of the query string
       * @param {jQuery.Event} $e
       * @return {Boolean}
       */

      Behavior.prototype.isSelectionEnd = function($e) {
        return $e.target.value.length === $e.target.selectionEnd;
      };


      /**
       * Open the autocomplete suggestions dropdown
       */

      Behavior.prototype.open = function() {
        this.isOpen = true;
        return this.$container.addClass('open');
      };


      /**
       * Show the suggestion the input field
       * @param  {Backbone.Model} suggestion
       */

      Behavior.prototype.fillSuggestion = function(suggestion) {
        return this.$autocomplete.val(suggestion.get('value'));
      };


      /**
       * Complete the suggestion
       * @param  {Backbone.Model} suggestion
       */

      Behavior.prototype.completeSuggestion = function(suggestion) {
        this.fillSuggestion(suggestion);
        return this.triggerShared("" + this.eventPrefix + ":close", this.$autocomplete.val());
      };


      /**
       * Close the autocomplete suggestions dropdown
       */

      Behavior.prototype.close = function() {
        this.isOpen = false;
        this.$container.removeClass('open');
        return this.suggestions.trigger('clear');
      };


      /**
       * Clean up `AutoComplete.CollectionView`
       */

      Behavior.prototype.onBeforeDestroy = function() {
        return this.collectionView.destroy();
      };

      return Behavior;

    })(Marionette.Behavior);
    return AutoComplete;
  });

}).call(this);
