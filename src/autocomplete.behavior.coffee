
  class AutoComplete.Behavior extends Marionette.Behavior

    ###*
     * @type {Object}
    ###
    defaults:
      rateLimit: 100
      minLength: 1
      
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
      'keyup @ui.autocomplete': 'onKeydown'
      'blur @ui.autocomplete': 'onBlur'

    ###*
     * @type {jQuery}
    ###
    container: $ '<div class="ac-container dropdown"></div>'

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
      @listenTo @view, "#{@eventPrefix}:find", @findSuggestions
      @listenTo @, "#{@eventPrefix}:open", @open
      @listenTo @, "#{@eventPrefix}:close", @close
      @listenTo @, "#{@eventPrefix}:suggestions:highlight", @fillSuggestion
      @listenTo @suggestions, 'selected', @completeSuggestion

    ###*
     * Initialize AutoComplete once the view el has been populated
    ###
    onRender: ->
      @_buildElement()

    ###*
     * Wrap the input element inside the `containerTemplate` and
     * then append `AutoComplete.CollectionView`
    ###
    _buildElement: ->
      @collectionView = @getCollectionView()
      @ui.autocomplete.after @container
      @container.append @collectionView.render().el
      @setInputElementAttributes()

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
    setInputElementAttributes: ->
      @ui.autocomplete
        .addClass 'ac-input'
        .attr
          autocomplete: 'off'
          spellcheck: off
          dir: 'auto'

    ###*
     * Handle keydown event.
     * @param {jQuery.Event} $e
    ###
    onKeydown: ($e) ->
      key = $e.which or $e.keyCode
      
      unless @ui.autocomplete.val().length < @options.minLength
        if @actionKeysMap[key]? then @doAction(key, $e) else @updateSuggestions @ui.autocomplete.val()

    ###*
     * Handle blur event.
    ###
    onBlur: ->
      setTimeout =>
        @trigger "#{@eventPrefix}:close", @ui.autocomplete.val() if @isOpen
      , 250

    ###*
     * Trigger action event based on keycode name.
     * @param {Number} keycode
     * @param {jQuery.Event} $e
    ###
    doAction: (keycode, $e) ->
      $e.preventDefault()
      $e.stopPropagation()
    
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
     * Update suggestions list, never directly call this use `@updateSuggestions`
     * which is a limit throttle alias.
     * @param {String} query
    ###
    _updateSuggestions: (query) ->
      @trigger "#{@eventPrefix}:open" unless @isOpen
      @findSuggestions query

    ###*
     * Find suggestions that match the specified query.
     * @param {string} query
    ###
    findSuggestions: (query) ->
      @suggestions.trigger 'find', query

    ###*
     * Check to see if the cursor is at the end of the query string.
     * @param {jQuery.Event} $e
     * @return {Boolean}
    ###
    isSelectionEnd: ($e) ->
      $e.target.value.length is $e.target.selectionEnd

    ###*
     * Open the autocomplete suggestions dropdown.
    ###
    open: ->
      @isOpen = yes
      @container.addClass 'open'

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
      @trigger "#{@eventPrefix}:close", @ui.autocomplete.val()
      @view.trigger "#{@eventPrefix}:selected", suggestion

    ###*
     * Close the autocomplete suggestions dropdown.
    ###
    close: ->
      @isOpen = no
      @container.removeClass 'open'
      @suggestions.trigger 'clear'

    ###*
     * Clean up `AutoComplete.CollectionView`.
    ###
    onDestroy: ->
      @collectionView.destroy()

  AutoComplete
