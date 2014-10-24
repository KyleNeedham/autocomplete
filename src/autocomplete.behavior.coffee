
  class AutoComplete.Behavior extends Marionette.Behavior

    ###*
     * @type {Object}
    ###
    defaults:
      containerTemplate: '<div class="ac-container dropdown"></div>'
      rateLimit: 500
      minLength: 1
      
      collection:
        definition: AutoComplete.Collection
        options:
          type: 'remote'
          remote: null
          data: []
          valueKey: 'value'
          keys:
            search: 'search'
            limit: 'limit'
          values:
            search: null
            limit: 10

      collectionView:
        definition: AutoComplete.CollectionView

      childView:
        definition: AutoComplete.ChildView

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
      @ui.input.wrap @options.containerTemplate
      @ui.container = @ui.input.parent()
      @collectionView = @_getCollectionView()
      @ui.container.append @collectionView.render().el

    ###*
     * Setup Collection view
     * 
     * @return {AutoComplete.CollectionView}
    ###
    _getCollectionView: ->
      new @options.collectionView.definition
        childView: @options.childView.definition
        collection: @suggestions

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
     *
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
      
      unless @suggestions.isEmpty()
        switch keyname
          when 'right'
            @suggestions.trigger 'select' if $e.target.value.length is $e.target.selectionEnd
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
     * which is a limit throttle alias
     * 
     * @param {String} suggestionPartial
    ###
    _updateSuggestions: (suggestionPartial) ->
      @triggerShared "#{@eventPrefix}:open" unless @isOpen
      @suggestions.trigger 'find', suggestionPartial

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
      @suggestions.trigger 'clear'

    ###*
     * Clean up `AutoComplete.CollectionView`
    ###
    onDestroy: ->
      @collectionView.destroy()

  AutoComplete
