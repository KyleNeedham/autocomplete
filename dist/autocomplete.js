(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  (function(root, factory) {
    if (typeof define === 'function' && define.amd) {
      return define(['underscore', 'jquery', 'backbone', 'marionette'], function(_, $, Backbone, Marionette) {
        return factory(root, {}, _, $, Backbone, Marionette);
      });
    } else {
      return root.AutoComplete = factory(root, {}, root._, root.jQuery, root.Backbone, root.Backbone.Marionette);
    }
  })(this, function(root, AutoComplete, _, $, Backbone, Marionette) {
    AutoComplete.Collection = (function(superClass) {
      extend(Collection, superClass);

      function Collection() {
        return Collection.__super__.constructor.apply(this, arguments);
      }


      /**
       * Setup remote collection.
       * @param {(Array|Backbone.Model[])} models
       * @param {Object} options
       */

      Collection.prototype.initialize = function(models, options1) {
        this.options = options1;
        this.setDataset(this.options.data);
        return this._startListening();
      };


      /**
       * Listen to relavent events
       */

      Collection.prototype._startListening = function() {
        this.listenTo(this, 'find', this.fetchNewSuggestions);
        this.listenTo(this, 'select', this.select);
        this.listenTo(this, 'highlight:next', this.highlightNext);
        this.listenTo(this, 'highlight:previous', this.highlightPrevious);
        return this.listenTo(this, 'clear', this.reset);
      };


      /**
       * Save models passed into the constructor seperately to avoid
       * rendering the entire dataset.
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
       * Get the value from an object using a string.
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
       * Get query parameters.
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
       * the api or filter the dataset.
       * @param {String} query
       */

      Collection.prototype.fetchNewSuggestions = function(query) {
        switch (this.options.type) {
          case 'remote':
            return this.fetch(_.extend({
              url: this.options.remote,
              reset: true
            }, this.getParams(query)));
          case 'dataset':
            return this.filterDataSet(query);
          default:
            throw new Error('Unkown type passed');
        }
      };


      /**
       * Filter the dataset.
       * @param {String} query
       */

      Collection.prototype.filterDataSet = function(query) {
        var matches;
        matches = [];
        this.index = -1;
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
       * Check to see if the query matches the suggestion.
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
       * Normalize string.
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
       * has been navigated then select at the current index.
       */

      Collection.prototype.select = function() {
        return this.trigger('selected', this.at(this.isStarted() ? this.index : 0));
      };


      /**
       * highlight previous item.
       */

      Collection.prototype.highlightPrevious = function() {
        if (!(this.isFirst() || !this.isStarted())) {
          this.removeHighlight(this.index);
          return this.highlight(this.index = this.index - 1);
        }
      };


      /**
       * highlight next item.
       */

      Collection.prototype.highlightNext = function() {
        if (!this.isLast()) {
          if (this.isStarted()) {
            this.removeHighlight(this.index);
          }
          return this.highlight(this.index = this.index + 1);
        }
      };


      /**
       * Check to see if the first suggestion is highlighted.
       * @return {Boolean}
       */

      Collection.prototype.isFirst = function() {
        return this.index === 0;
      };


      /**
       * Check to see if the last suggestion is highlighted.
       * @return {Boolean}
       */

      Collection.prototype.isLast = function() {
        return this.index + 1 === this.length;
      };


      /**
       * Check to see if we have navigated through the
       * suggestions list yet.
       * @return {Boolean}
       */

      Collection.prototype.isStarted = function() {
        return this.index !== -1;
      };


      /**
       * Trigger highlight on suggestion.
       * @param  {Number} index
       * @return {Backbone.Model}
       */

      Collection.prototype.highlight = function(index) {
        var model;
        model = this.at(index);
        return model.trigger('highlight', model);
      };


      /**
       * Trigger highliht removal on the model.
       * @param  {Number} index
       * @return {Backbone.Model}
       */

      Collection.prototype.removeHighlight = function(index) {
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
    AutoComplete.ChildView = (function(superClass) {
      extend(ChildView, superClass);

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
        e.stopPropagation();
        return this.model.trigger('selected', this.model);
      };

      return ChildView;

    })(Marionette.ItemView);
    AutoComplete.CollectionView = (function(superClass) {
      extend(CollectionView, superClass);

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
        style: 'width: 100%;'
      };


      /**
       * @return {Marionette.ItemView}
       */

      CollectionView.prototype.emptyView = Marionette.ItemView.extend({
        tagName: 'li',
        template: _.template("<a>No suggestions available</a>")
      });

      return CollectionView;

    })(Marionette.CollectionView);
    AutoComplete.Behavior = (function(superClass) {
      extend(Behavior, superClass);

      function Behavior() {
        this.toggleDropdown = bind(this.toggleDropdown, this);
        return Behavior.__super__.constructor.apply(this, arguments);
      }


      /**
       * @type {Object}
       */

      Behavior.prototype.defaults = {
        rateLimit: 0,
        minLength: 0,
        collection: {
          "class": AutoComplete.Collection,
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
          "class": AutoComplete.CollectionView
        },
        childView: {
          "class": AutoComplete.ChildView
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
        'keyup @ui.autocomplete': 'onKeyUp'
      };


      /**
       * Setup the AutoComplete options and suggestions collection.
       */

      Behavior.prototype.initialize = function(options) {
        this.options = $.extend(true, {}, this.defaults, options);
        this.suggestions = new this.options.collection["class"]([], this.options.collection.options);
        this.updateSuggestions = _.throttle(this._updateSuggestions, this.options.rateLimit);
        return this._startListening();
      };


      /**
       * Listen to relavent events
       */

      Behavior.prototype._startListening = function() {
        this.listenTo(this.suggestions, 'selected', this.completeSuggestion);
        this.listenTo(this.suggestions, 'highlight', this.fillSuggestion);
        return this.listenTo(this.view, this.eventPrefix + ":find", this.findRelatedSuggestions);
      };


      /**
       * Initialize AutoComplete once the view el has been populated
       */

      Behavior.prototype.onRender = function() {
        this._setInputAttributes();
        return this._buildElement();
      };


      /**
       * Wrap the input element inside the `containerTemplate` and
       * then append `AutoComplete.CollectionView`
       */

      Behavior.prototype._buildElement = function() {
        var container;
        container = $('<div class="ac-container dropdown"></div>');
        this.collectionView = this.getCollectionView();
        this.ui.autocomplete.replaceWith(container);
        return container.append(this.ui.autocomplete).append(this.collectionView.render().el);
      };


      /**
       * Setup Collection view.
       * @return {AutoComplete.CollectionView}
       */

      Behavior.prototype.getCollectionView = function() {
        return new this.options.collectionView["class"]({
          childView: this.options.childView["class"],
          collection: this.suggestions
        });
      };


      /**
       * Set input attributes.
       */

      Behavior.prototype._setInputAttributes = function() {
        return this.ui.autocomplete.attr({
          autocomplete: false,
          spellcheck: false,
          dir: 'auto',
          'data-toggle': 'dropdown'
        });
      };


      /**
       * Handle keyup event.
       * @param {jQuery.Event} $e
       */

      Behavior.prototype.onKeyUp = function($e) {
        var key;
        $e.preventDefault();
        $e.stopPropagation();
        key = $e.which || $e.keyCode;
        if (!(this.ui.autocomplete.val().length < this.options.minLength)) {
          if (this.actionKeysMap[key] != null) {
            return this.doAction(key, $e);
          } else {
            return this.updateSuggestions(this.ui.autocomplete.val());
          }
        }
      };


      /**
       * Trigger action event based on keycode name.
       * @param {Number} keycode
       * @param {jQuery.Event} $e
       */

      Behavior.prototype.doAction = function(keycode, $e) {
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
              return this.trigger(this.eventPrefix + ":close");
          }
        }
      };


      /**
       * Toggle the autocomplete dropdown.
       */

      Behavior.prototype.toggleDropdown = function() {
        return this.ui.autocomplete.dropdown('toggle');
      };


      /**
       * @param {string} query
       */

      Behavior.prototype.findRelatedSuggestions = function(query) {
        this.ui.autocomplete.val(query);
        this.updateSuggestions(query);
        return this.toggleDropdown();
      };


      /**
       * Update suggestions list, never directly call this use `@updateSuggestions`
       * which is a limit throttle alias.
       * @param {String} query
       */

      Behavior.prototype._updateSuggestions = function(query) {
        return this.suggestions.trigger('find', query);
      };


      /**
       * Check to see if the cursor is at the end of the query string.
       * @param {jQuery.Event} $e
       * @return {Boolean}
       */

      Behavior.prototype.isSelectionEnd = function($e) {
        return $e.target.value.length === $e.target.selectionEnd;
      };


      /**
       * Show the suggestion the input field.
       * @param  {Backbone.Model} suggestion
       */

      Behavior.prototype.fillSuggestion = function(suggestion) {
        this.ui.autocomplete.val(suggestion.get('value'));
        return this.view.trigger(this.eventPrefix + ":active", suggestion);
      };


      /**
       * Complete the suggestion.
       * @param  {Backbone.Model} suggestion
       */

      Behavior.prototype.completeSuggestion = function(suggestion) {
        this.fillSuggestion(suggestion);
        this.view.trigger(this.eventPrefix + ":selected", suggestion);
        return this.toggleDropdown();
      };


      /**
       * Clean up `AutoComplete.CollectionView`.
       */

      Behavior.prototype.onDestroy = function() {
        return this.collectionView.destroy();
      };

      return Behavior;

    })(Marionette.Behavior);
    return AutoComplete;
  });

}).call(this);
