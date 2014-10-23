
  class AutoComplete.Behavior extends Marionette.Behavior

    ###*
     * @type {Object}
    ###
    defaults:
      containerTemplate: '<div class="ac-container dropdown"></div>'
      type: 'remote'
      data: []
      remote: null
      valueKey: 'value'

      paramKeys:
        search: 'search'
        limit: 'limit'

      paramValues:
        search: null
        limit: 10

      rateLimit: 500
      minLength: 1

    ###*
     * @type {String}
    ###
    eventPrefix: 'autocomplete'

    ###*
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
    ui:
      input: '[data-action="autocomplete"]'

    ###*
     * @type {Object}
    ###
    events:
      'keyup @ui.input': 'onKeydown'
      'blur @ui.input': 'onBlur'

    ###*
     * Initialize AutoComplete
     * 
     * @param {Object} options
    ###
    initialize: (options) ->
      @options.paramKeys = _.extend @defaults.paramKeys, @options.paramKeys
      @options.paramValues = _.extend @defaults.paramValues, @options.paramValues
      @updateSuggestions = _.throttle @_updateSuggestions, @options.rateLimit
      @_initializeSuggestionsCollection()
      @_initializeListeners()

    ###*
     * Setup the remote collection, passing options required
     * 
     * @return {AutoCompleteCollection}
    ###
    _initializeSuggestionsCollection: ->
      @suggestionsCollection =
        new AutoComplete.Collection @options.data, _.omit @options, [
          'containerTemplate'
          'rateLimit'
          'minLength'
        ]

    ###*
     * Listen to relavent events
    ###
    _initializeListeners: ->
      @listenTo @suggestionsCollection, 'all', @relayCollectionEvent
      @listenTo @, "#{@eventPrefix}:open", @open
      @listenTo @, "#{@eventPrefix}:close", @close
      @listenTo @, "#{@eventPrefix}:suggestions:selected", @completeSuggestion

    ###*
     * Initialize AutoComplete once the view el has been populated
    ###
    onRender: ->
      @_initializeAutoComplete()
      @setInputElementAttributes()

    ###*
     * Wrap the input element inside the `containerTemplate` and
     * then append the `dropdownTemplate`
    ###
    _initializeAutoComplete: ->
      @ui.input.wrap @options.containerTemplate
      @ui.container = @ui.input.parent()
      @collectionView = @_getCollectionView()
      @ui.container.append @collectionView.render().el

    ###*
     * Setup Collection view
     * 
     * @return {AutoCompleteCollectionView}
    ###
    _getCollectionView: ->
      new AutoComplete.CollectionView
        collection: @suggestionsCollection

    ###*
     * Set input attributes
    ###
    setInputElementAttributes: ->
      @ui.input
        .addClass 'ac-input'
        .attr
          autocomplete: 'off'
          spellcheck: off
          dir: 'auto'

    ###*
     * Relay the collecction events
    ###
    relayCollectionEvent: (name, args) ->
      @triggerShared "#{@eventPrefix}:suggestions:#{name}", args

    ###*
     * Trigger an event on the behavior and view
    ###
    triggerShared: ->
      @trigger arguments...
      @view.trigger arguments...

    ###*
     * Handle keydown event
     * 
     * @param {jQuery.Event} $e
    ###
    onKeydown: ($e) ->
      key = $e.which or $e.keyCode

      unless @ui.input.val().length < @options.minLength
        if @actionKeysMap[key]? then @doAction(key, $e) else @updateSuggestions @ui.input.val()

    ###*
     * Handle blur event
    ###
    onBlur: ->
      setTimeout =>
        @triggerShared "#{@eventPrefix}:close", @ui.input.val() if @isOpen
      , 250

    ###*
     * Trigger action event based on keycode name
     * 
     * @param {Number} keycode
     * @param {jQuery.Event} $e
    ###
    doAction: (keycode, $e) ->
      keyname = @actionKeysMap[keycode]
      
      unless @suggestionsCollection.isEmpty()
        switch keyname
          when 'right'
            @suggestionsCollection.trigger 'select:active' if $e.target.value.length is $e.target.selectionEnd
          when 'enter'
            @suggestionsCollection.trigger 'select:active'
          when 'down'
            @suggestionsCollection.trigger 'highlight:next'
          when 'up'
            @suggestionsCollection.trigger 'highlight:previous'
          when 'esc'
            @trigger "#{@eventPrefix}:close"

    ###*
     * Update suggestions list, never directly call this use `@updateSuggestions`
     * which is a limit throttle alias
     * 
     * @param {String} suggestionPartial
    ###
    _updateSuggestions: (suggestionPartial) ->
      @triggerShared "#{@eventPrefix}:open" unless @isOpen
      @suggestionsCollection.trigger 'find', suggestionPartial

    ###*
     * Open the autocomplete suggestions dropdown
    ###
    open: ->
      @isOpen = yes
      @ui.container.addClass 'open'

    ###*
     * Complete the suggestion
     * 
     * @param  {Backbone.Model} selection
    ###
    completeSuggestion: (selection) ->
      @ui.input.val selection.get 'value'
      @triggerShared "#{@eventPrefix}:close", @ui.input.val()

    ###*
     * Close the autocomplete suggestions dropdown
     * 
     * @param {String} suggestionPartial
    ###
    close: (suggestionPartial) ->
      @isOpen = no
      @ui.container.removeClass 'open'
      @suggestionsCollection.trigger 'clear'

    ###*
     * Clean up views
    ###
    onDestroy: ->
      @collectionView.destroy()
