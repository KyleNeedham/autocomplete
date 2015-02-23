
  class AutoComplete.Behavior extends Marionette.Behavior

    ###*
     * @type {Object}
    ###
    defaults:
      containerTemplate: '<div class="ac-container dropdown"></div>'
      rateLimit: 100
      minLength: 1
      
      collection:
        definition: AutoComplete.Collection
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
        definition: AutoComplete.CollectionView

      childView:
        definition: AutoComplete.ChildView

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
     * Setup the AutoComplete options and suggestions collection.
    ###
    initialize: (options) ->
      @options = $.extend yes, {}, @defaults, options
      @suggestions = new @options.collection.definition [], @options.collection.options
      @updateSuggestions = _.throttle @_updateSuggestions, @options.rateLimit

      @_initializeListeners()

    ###*
     * Listen to relavent events
    ###
    _initializeListeners: ->
      @listenTo @suggestions, 'all', @relayCollectionEvent
      @listenTo @, "#{@eventPrefix}:open", @open
      @listenTo @, "#{@eventPrefix}:close", @close
      @listenTo @, "#{@eventPrefix}:suggestions:highlight", @fillSuggestion
      @listenTo @, "#{@eventPrefix}:suggestions:selected", @completeSuggestion

    ###*
     * Initialize AutoComplete once the view el has been populated
    ###
    onRender: ->
      @_initializeAutoComplete()
      @setInputElementAttributes()

    ###*
     * Wrap the input element inside the `containerTemplate` and
     * then append `AutoComplete.CollectionView`
    ###
    _initializeAutoComplete: ->
      @$autocomplete = @view.ui.autocomplete
      @$autocomplete.wrap @options.containerTemplate
      @$container = @$autocomplete.parent()
      @collectionView = @getCollectionView()
      @$container.append @collectionView.render().el

    ###*
     * Setup Collection view
     * @return {AutoComplete.CollectionView}
    ###
    getCollectionView: ->
      new @options.collectionView.definition
        childView: @options.childView.definition
        collection: @suggestions

    ###*
     * Set input attributes
    ###
    setInputElementAttributes: ->
      @$autocomplete
        .addClass 'ac-input'
        .attr
          autocomplete: 'off'
          spellcheck: off
          dir: 'auto'

    ###*
     * Relay the collecction events
     * @param {String} name
     * @param {Array} args
    ###
    relayCollectionEvent: (name, args) ->
      @triggerShared "#{@eventPrefix}:suggestions:#{name}", args

    ###*
     * Trigger an event on this and view
    ###
    triggerShared: ->
      @trigger arguments...
      @view.trigger arguments...

    ###*
     * Handle keydown event
     * @param {jQuery.Event} $e
    ###
    onKeydown: ($e) ->
      key = $e.which or $e.keyCode
      
      unless @$autocomplete.val().length < @options.minLength
        if @actionKeysMap[key]? then @doAction(key, $e) else @updateSuggestions @$autocomplete.val()

    ###*
     * Handle blur event
    ###
    onBlur: ->
      setTimeout =>
        @triggerShared "#{@eventPrefix}:close", @$autocomplete.val() if @isOpen
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
      @triggerShared "#{@eventPrefix}:open" unless @isOpen
      @suggestions.trigger 'find', query

    ###*
     * Check to see if the cursor is at the end of the query string
     * @param {jQuery.Event} $e
     * @return {Boolean}
    ###
    isSelectionEnd: ($e) ->
      $e.target.value.length is $e.target.selectionEnd

    ###*
     * Open the autocomplete suggestions dropdown
    ###
    open: ->
      @isOpen = yes
      @$container.addClass 'open'

    ###*
     * Show the suggestion the input field
     * @param  {Backbone.Model} suggestion
    ###
    fillSuggestion: (suggestion) ->
      @$autocomplete.val suggestion.get 'value'
      
    ###*
     * Complete the suggestion
     * @param  {Backbone.Model} suggestion
    ###
    completeSuggestion: (suggestion) ->
      @fillSuggestion suggestion
      @triggerShared "#{@eventPrefix}:close", @$autocomplete.val()

    ###*
     * Close the autocomplete suggestions dropdown 
    ###
    close: ->
      @isOpen = no
      @$container.removeClass 'open'
      @suggestions.trigger 'clear'

    ###*
     * Clean up `AutoComplete.CollectionView`
    ###
    onBeforeDestroy: ->
      @collectionView.destroy()

  AutoComplete
