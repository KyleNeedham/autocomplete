
  class AutoComplete.Collection extends Backbone.Collection

    ###*
     * Setup remote collection
     *
     * @class
     * @param {(Array|Backbone.Model[])} models
     * @param {Object} options
    ###
    initialize: (models, @options) ->
      @setDataset options.data
      @_initializeListeners()

    ###*
     * Listen to relavent events
    ###
    _initializeListeners: ->
      @listenTo @, 'find', @fetchNewSuggestions
      @listenTo @, 'select', @select
      @listenTo @, 'highlight:next', @highlightNext
      @listenTo @, 'highlight:previous', @highlightPrevious
      @listenTo @, 'clear', @reset

    ###*
     * Save models passed into the constructor seperately to avoid
     * rendering the entire dataset
     *
     * @param {(Array|Backbone.Model[])} dataset
    ###
    setDataset: (dataset) ->
      @dataset = @parse dataset, no

    ###*
     * Parse API response
     * @param  {Array} suggestions
     * @param  {Boolean} limit
     * @return {Object}
    ###
    parse: (suggestions, limit) ->
      suggestions = _.take suggestions, @options.values.limit if limit

      _.map suggestions, (suggestion) ->
        value: @getValue suggestion
      , @

    ###*
     * Get the value to filter on and display in the suggestions list
     * 
     * @param  {Object} suggestion
     * @return {String}
    ###
    getValue: (suggestion) ->
      _.reduce @options.valueKey.split('.'), (segment, property) ->
        segment[property]
      , suggestion

    ###*
     * Get query parameters
     *
     * @param {String} query
     * @return {Obect}
    ###
    buildParams: (query) ->
      data = {}

      data[@options.keys.query] = query 

      _.each @options.keys, (key) ->
        data[key] ?= @options.values[key]
      , @

      { data }

    ###*
     * Get suggestions based on the current input. Either query
     * the api or filter the dataset
     * 
     * @param {String} query
    ###
    fetchNewSuggestions: (query) ->
      switch @options.type
        when 'remote'
          @fetch _.extend url: @options.remote, @buildParams query
        when 'dataset'
          @filterDataSet query
        else
          throw new Error 'Unkown type passed'

    ###*
     * Filter the dataset
     *
     * @param {String} query
    ###
    filterDataSet: (query) ->
      matches = []

      _.each @dataset, (suggestion) ->
        return false if matches.length >= @options.values.limit

        matches.push suggestion if @matches suggestion.value, query

      , @

      @reset matches

    ###*
     * Check to see if the query matches the suggestion
     * 
     * @param  {String} suggestion
     * @param  {String} query
     * @return {Boolean}
    ###
    matches: (suggestion, query) ->
      suggestion = @normalizeValue suggestion
      query = @normalizeValue query

      suggestion.indexOf(query) >= 0

    ###*
     * Normalize string
     * 
     * @return {String}
    ###
    normalizeValue: (string = '') ->
      string
        .toLowerCase()
        .replace /^\s*/g, ''
        .replace /\s{2,}/g, ' '

    ###*
     * Select first suggestion unless the suggestion list
     * has been navigated then select at the current index
    ###
    select: ->
      @trigger 'selected', @at if @isStarted() then @index else 0

    ###*
     * highlight previous item
    ###
    highlightPrevious: ->
      unless @isFirst() or not @isStarted()
        @deHighlight @index
        @highlight @index = @index - 1

    ###*
     * highlight next item
    ###
    highlightNext: ->
      unless @isLast()

        if @isStarted()
          @deHighlight @index

        @highlight @index = @index + 1

    ###*
     * Check to see if the first suggestion is highlighted
     * 
     * @return {Boolean}
    ###
    isFirst: ->
      @index is 0

    ###*
     * Check to see if the last suggestion is highlighted
     * 
     * @return {Boolean}
    ###
    isLast: ->
      @index + 1 is @length

    ###*
     * Check to see if we have navigated through the
     * suggestions list yet
     * 
     * @return {Boolean}
    ###
    isStarted: ->
      @index isnt -1

    ###*
     * Trigger highlight on suggestion
     * 
     * @param  {Number} index
     * @return {Backbone.Model}
    ###
    highlight: (index) ->
      model = @at index
      model.trigger 'highlight', model

    ###*
     * Trigger highliht removal on the model
     * 
     * @param  {Number} index
     * @return {Backbone.Model}
    ###
    deHighlight: (index) ->
      model = @at index
      model.trigger 'highlight:remove', model

    ###*
     * Reset suggestions
    ###
    reset: ->
      @index = -1
      super arguments...
