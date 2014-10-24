(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  (function(root, factory) {
    if (typeof define === 'function' && define.amd) {
      return define(['jquery', 'underscore', 'backbone', 'marionette'], factory);
    } else {
      return root.AutoComplete = factory(root, {}, root.Backbone.$, root._, root.Backbone, root.Backbone.Marionette);
    }
  })(this, function(root, AutoComplete, $, _, Backbone, Marionette) {
    AutoComplete.Collection = (function(_super) {
      __extends(Collection, _super);


      /**
       * Setup remote collection
       *
       * @class
       * @param {(Array|Backbone.Model[])} models
       * @param {Object} options
       */

      function Collection(models, options) {
        this.options = options;
        this.setDataset(models);
        Collection.__super__.constructor.call(this, [], options);
      }


      /**
       * Initialize AutoCompleteCollection
       * 
       * @param {(Array|Backbone.Model[])} models
       * @param {Object} options
       */

      Collection.prototype.initialize = function(models, options) {
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
       *
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
        if (limit) {
          suggestions = _.take(suggestions, this.options.paramValues.limit);
        }
        return _.map(suggestions, function(suggestion) {
          return {
            value: this.getValue(suggestion)
          };
        }, this);
      };


      /**
       * Get the value to filter on and display in the suggestions list
       * 
       * @param  {Object} suggestion
       * @return {String}
       */

      Collection.prototype.getValue = function(suggestion) {
        return _.reduce(this.options.valueKey.split('.'), function(segment, property) {
          return segment[property];
        }, suggestion);
      };


      /**
       * Get query parameters
       *
       * @param {String} string
       * @return {Obect}
       */

      Collection.prototype.buildParams = function(search) {
        var data;
        data = {};
        data[this.options.paramKeys.search] = search;
        _.each(this.options.paramKeys, function(key) {
          return data[key] != null ? data[key] : data[key] = this.options.paramValues[key];
        }, this);
        return {
          data: data
        };
      };


      /**
       * Get suggestions based on the current input. Either query
       * the api or filter the dataset
       * 
       * @param {String} search
       */

      Collection.prototype.fetchNewSuggestions = function(search) {
        switch (this.options.type) {
          case 'remote':
            return this.fetch(_.extend({
              url: this.options.remote
            }, this.buildParams(search)));
          case 'dataset':
            return this.filterDataSet(search);
          default:
            throw new Error('Unkown type passed');
        }
      };


      /**
       * Filter the dataset
       *
       * @param {String} string
       */

      Collection.prototype.filterDataSet = function(search) {
        var matches;
        matches = [];
        _.each(this.dataset, function(suggestion) {
          if (matches.length >= this.options.paramValues.limit) {
            return false;
          }
          if (this.matches(suggestion.value, search)) {
            return matches.push(suggestion);
          }
        }, this);
        return this.reset(matches);
      };


      /**
       * Check to see if the search matches the suggestion
       * 
       * @param  {String} suggestion
       * @param  {String} search
       * @return {Boolean}
       */

      Collection.prototype.matches = function(suggestion, search) {
        suggestion = this.normalizeValue(suggestion);
        search = this.normalizeValue(search);
        return suggestion.indexOf(search) >= 0;
      };


      /**
       * Normalize string
       * 
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
        return this.trigger('select', this.at(this.isStarted() ? this.index : 0));
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
       * 
       * @return {Boolean}
       */

      Collection.prototype.isFirst = function() {
        return this.index === 0;
      };


      /**
       * Check to see if the last suggestion is highlighted
       * 
       * @return {Boolean}
       */

      Collection.prototype.isLast = function() {
        return this.index + 1 === this.length;
      };


      /**
       * Check to see if we have navigated through the
       * suggestions list yet
       * 
       * @return {Boolean}
       */

      Collection.prototype.isStarted = function() {
        return this.index !== -1;
      };


      /**
       * Trigger highlight on suggestion
       * 
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
       * 
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

      ChildView.prototype.className = 'ac-suggestion';


      /**
       * @type {String}
       */

      ChildView.prototype.template = _.template('<a href="#"><%= value %></a>');


      /**
       * @type {Object}
       */

      ChildView.prototype.events = {
        'click a': 'select'
      };


      /**
       * @type {Object}
       */

      ChildView.prototype.modelEvents = {
        'highlight': 'highlight',
        'highlight:remove': 'removeHighlight'
      };


      /**
       * Make suggestion active
       */

      ChildView.prototype.highlight = function() {
        return this.$el.addClass('active');
      };


      /**
       * Remove suggestion highlight
       */

      ChildView.prototype.removeHighlight = function() {
        return this.$el.removeClass('active');
      };


      /**
       * Make the model active
       */

      ChildView.prototype.select = function(e) {
        e.preventDefault();
        return this.model.trigger('select', this.model);
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
       * @type {AutoComplete.ChildView}
       */

      CollectionView.prototype.childView = AutoComplete.ChildView;

      return CollectionView;

    })(Marionette.CollectionView);
    return AutoComplete.Behavior = (function(_super) {
      __extends(Behavior, _super);

      function Behavior() {
        return Behavior.__super__.constructor.apply(this, arguments);
      }


      /**
       * @type {Object}
       */

      Behavior.prototype.defaults = {
        containerTemplate: '<div class="ac-container dropdown"></div>',
        type: 'remote',
        data: [],
        remote: null,
        valueKey: 'value',
        paramKeys: {
          search: 'search',
          limit: 'limit'
        },
        paramValues: {
          search: null,
          limit: 10
        },
        rateLimit: 500,
        minLength: 1
      };


      /**
       * @type {String}
       */

      Behavior.prototype.eventPrefix = 'autocomplete';


      /**
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

      Behavior.prototype.ui = {
        input: '[data-action="autocomplete"]'
      };


      /**
       * @type {Object}
       */

      Behavior.prototype.events = {
        'keyup @ui.input': 'onKeydown',
        'blur @ui.input': 'onBlur'
      };


      /**
       * Initialize AutoComplete
       * 
       * @param {Object} options
       */

      Behavior.prototype.initialize = function(options) {
        this.options.paramKeys = _.extend(this.defaults.paramKeys, this.options.paramKeys);
        this.options.paramValues = _.extend(this.defaults.paramValues, this.options.paramValues);
        this.updateSuggestions = _.throttle(this._updateSuggestions, this.options.rateLimit);
        this._initializeSuggestionsCollection();
        return this._initializeListeners();
      };


      /**
       * Setup the remote collection, passing options required
       * 
       * @return {AutoCompleteCollection}
       */

      Behavior.prototype._initializeSuggestionsCollection = function() {
        return this.suggestionsCollection = new AutoComplete.Collection(this.options.data, _.omit(this.options, ['containerTemplate', 'rateLimit', 'minLength']));
      };


      /**
       * Listen to relavent events
       */

      Behavior.prototype._initializeListeners = function() {
        this.listenTo(this.suggestionsCollection, 'all', this.relayCollectionEvent);
        this.listenTo(this, "" + this.eventPrefix + ":open", this.open);
        this.listenTo(this, "" + this.eventPrefix + ":close", this.close);
        return this.listenTo(this, "" + this.eventPrefix + ":suggestions:select", this.completeSuggestion);
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
        this.ui.input.wrap(this.options.containerTemplate);
        this.ui.container = this.ui.input.parent();
        this.collectionView = this._getCollectionView();
        return this.ui.container.append(this.collectionView.render().el);
      };


      /**
       * Setup Collection view
       * 
       * @return {AutoComplete.CollectionView}
       */

      Behavior.prototype._getCollectionView = function() {
        return new AutoComplete.CollectionView({
          collection: this.suggestionsCollection
        });
      };


      /**
       * Set input attributes
       */

      Behavior.prototype.setInputElementAttributes = function() {
        return this.ui.input.addClass('ac-input').attr({
          autocomplete: 'off',
          spellcheck: false,
          dir: 'auto'
        });
      };


      /**
       * Relay the collecction events
       *
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
       * 
       * @param {jQuery.Event} $e
       */

      Behavior.prototype.onKeydown = function($e) {
        var key;
        key = $e.which || $e.keyCode;
        if (!(this.ui.input.val().length < this.options.minLength)) {
          if (this.actionKeysMap[key] != null) {
            return this.doAction(key, $e);
          } else {
            return this.updateSuggestions(this.ui.input.val());
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
              return _this.triggerShared("" + _this.eventPrefix + ":close", _this.ui.input.val());
            }
          };
        })(this), 250);
      };


      /**
       * Trigger action event based on keycode name
       * 
       * @param {Number} keycode
       * @param {jQuery.Event} $e
       */

      Behavior.prototype.doAction = function(keycode, $e) {
        var keyname;
        keyname = this.actionKeysMap[keycode];
        if (!this.suggestionsCollection.isEmpty()) {
          switch (keyname) {
            case 'right':
              if ($e.target.value.length === $e.target.selectionEnd) {
                return this.suggestionsCollection.trigger('select:active');
              }
              break;
            case 'enter':
              return this.suggestionsCollection.trigger('select:active');
            case 'down':
              return this.suggestionsCollection.trigger('highlight:next');
            case 'up':
              return this.suggestionsCollection.trigger('highlight:previous');
            case 'esc':
              return this.trigger("" + this.eventPrefix + ":close");
          }
        }
      };


      /**
       * Update suggestions list, never directly call this use `@updateSuggestions`
       * which is a limit throttle alias
       * 
       * @param {String} suggestionPartial
       */

      Behavior.prototype._updateSuggestions = function(suggestionPartial) {
        if (!this.isOpen) {
          this.triggerShared("" + this.eventPrefix + ":open");
        }
        return this.suggestionsCollection.trigger('find', suggestionPartial);
      };


      /**
       * Open the autocomplete suggestions dropdown
       */

      Behavior.prototype.open = function() {
        this.isOpen = true;
        return this.ui.container.addClass('open');
      };


      /**
       * Complete the suggestion
       * 
       * @param  {Backbone.Model} selection
       */

      Behavior.prototype.completeSuggestion = function(selection) {
        this.ui.input.val(selection.get('value'));
        return this.triggerShared("" + this.eventPrefix + ":close", this.ui.input.val());
      };


      /**
       * Close the autocomplete suggestions dropdown
       * 
       * @param {String} suggestionPartial
       */

      Behavior.prototype.close = function(suggestionPartial) {
        this.isOpen = false;
        this.ui.container.removeClass('open');
        return this.suggestionsCollection.trigger('clear');
      };


      /**
       * Clean up `AutoComplete.CollectionView`
       */

      Behavior.prototype.onDestroy = function() {
        return this.collectionView.destroy();
      };

      return Behavior;

    })(Marionette.Behavior);
  });

}).call(this);
