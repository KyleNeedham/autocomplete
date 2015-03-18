
  class AutoComplete.Behavior extends Marionette.Behavior

    ###*
     * @type {Object}
    ###
    defaults:
      rateLimit: 0
      minLength: 0
      
      collection:
        class: AutoComplete.Collection
        options:
          type: 'remote'
          remote: null
          data: []
          parseKey: null
          valueKey: 'value'
          keys:
            query: 'query'
            limit: 'limit'
          values:
            query: null
            limit: 10

      collectionView:
        class: AutoComplete.CollectionView

      childView:
        class: AutoComplete.ChildView

    ###*
     * This is the event prefix that will be used to fire all events on.
     * @type {String}
    ###
    eventPrefix: 'autocomplete'

    ###*
     * Map which code relates to what action.
     * @type {Object}
    ###
    actionKeysMap:
      27: 'esc'
      37: 'left'
      39: 'right'
      13: 'enter'
      38: 'up'
      40: 'down'

    ###*
     * @type {Object}
    ###
    events:
      'keyup @ui.autocomplete': 'onKeyUp'

    ###*
     * Setup the AutoComplete options and suggestions collection.
    ###
    initialize: (options) ->
      @options = $.extend yes, {}, @defaults, options
      @suggestions = new @options.collection.class [], @options.collection.options
      @updateSuggestions = _.throttle @_updateSuggestions, @options.rateLimit

      @_startListening()

    ###*
     * Listen to relavent events
    ###
    _startListening: ->
      @listenTo @suggestions, 'selected', @completeSuggestion
      @listenTo @suggestions, 'highlight', @fillSuggestion
      @listenTo @view, "#{@eventPrefix}:find", @findRelatedSuggestions

    ###*
     * Initialize AutoComplete once the view el has been populated
    ###
    onRender: ->
      @_setInputAttributes()
      @_buildElement()

    ###*
     * Wrap the input element inside the `containerTemplate` and
     * then append `AutoComplete.CollectionView`
    ###
    _buildElement: ->
      container = $ '<div class="ac-container dropdown"></div>'
      @collectionView = @getCollectionView()

      @ui.autocomplete.replaceWith container

      container
        .append @ui.autocomplete
        .append @collectionView.render().el

    ###*
     * Setup Collection view.
     * @return {AutoComplete.CollectionView}
    ###
    getCollectionView: ->
      new @options.collectionView.class
        childView: @options.childView.class
        collection: @suggestions

    ###*
     * Set input attributes.
    ###
    _setInputAttributes: ->
      @ui.autocomplete
        .attr
          autocomplete: off
          spellcheck: off
          dir: 'auto'
          'data-toggle': 'dropdown'

    ###*
     * Handle keyup event.
     * @param {jQuery.Event} $e
    ###
    onKeyUp: ($e) ->
      $e.preventDefault()
      $e.stopPropagation()

      key = $e.which or $e.keyCode

      unless @ui.autocomplete.val().length < @options.minLength
        if @actionKeysMap[key]? then @doAction(key, $e) else @updateSuggestions @ui.autocomplete.val()

    ###*
     * Trigger action event based on keycode name.
     * @param {Number} keycode
     * @param {jQuery.Event} $e
    ###
    doAction: (keycode, $e) ->
      unless @suggestions.isEmpty()
        switch @actionKeysMap[keycode]
          when 'right'
            @suggestions.trigger 'select' if @isSelectionEnd $e
          when 'enter'
            @suggestions.trigger 'select'
          when 'down'
            @suggestions.trigger 'highlight:next'
          when 'up'
            @suggestions.trigger 'highlight:previous'
          when 'esc'
            @trigger "#{@eventPrefix}:close"

    ###*
     * Toggle the autocomplete dropdown.
    ###
    toggleDropdown: =>
      @ui.autocomplete.dropdown 'toggle'

    ###*
     * @param {string} query
    ###
    findRelatedSuggestions: (query) ->
      @ui.autocomplete.val query
      @updateSuggestions query
      @toggleDropdown()

    ###*
     * Update suggestions list, never directly call this use `@updateSuggestions`
     * which is a limit throttle alias.
     * @param {String} query
    ###
    _updateSuggestions: (query) ->
      @suggestions.trigger 'find', query

    ###*
     * Check to see if the cursor is at the end of the query string.
     * @param {jQuery.Event} $e
     * @return {Boolean}
    ###
    isSelectionEnd: ($e) ->
      $e.target.value.length is $e.target.selectionEnd

    ###*
     * Show the suggestion the input field.
     * @param  {Backbone.Model} suggestion
    ###
    fillSuggestion: (suggestion) ->
      @ui.autocomplete.val suggestion.get 'value'
      @view.trigger "#{@eventPrefix}:active", suggestion
      
    ###*
     * Complete the suggestion.
     * @param  {Backbone.Model} suggestion
    ###
    completeSuggestion: (suggestion) ->
      @fillSuggestion suggestion
      @view.trigger "#{@eventPrefix}:selected", suggestion
      @toggleDropdown()

    ###*
     * Clean up `AutoComplete.CollectionView`.
    ###
    onDestroy: ->
      @collectionView.destroy()

  AutoComplete
