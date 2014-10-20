((root, factory) ->
  if typeof define is 'function' and define.amd
    define ['jquery', 'underscore', 'backbone'], factory
  else
    root.Autocomplete = factory(root.jQuery, root._, root.Backbone)
) @, ($, _, Backbone) ->

  class DropdownItemModel extends Backbone.Model
    getLabel: ->
      @get 'label'
    getValue: ->
      @get 'id'

  class DropdownUrlCollection extends Backbone.Collection

    ###*
     * DropdownUrlCollection
     * 
     * @param  {Backbone.Model[]} models
     * @param  {Object} options
     * @return {Void}
     * @throws {Error} If no API endpoint provided.
    ###
    constructor: (models, @options)->
      super
      throw new Error 'No API endpoint provided.' unless @options.apiUrl

    ###*
     * @type {Backbone.Model}
    ###
    model: DropdownItemModel

    ###*
     * @return {String}
    ###
    url: ->
      _.result @options, 'apiUrl'

  class DropdownListView extends Backbone.View
    ###*
     * @type {String}
    ###
    tagName: 'ul'

  class DropdownLabelView extends Backbone.View
    ###*
     * @type {Object}
    ###
    events: 'keydown input': 'handleKeydown'

    ###*
     * @type {String}
    ###
    tagName: 'input'

    ###*
     * @type {Object}
    ###
    attributes:
      type: 'text'

    ###*
     * handleKeydown
     * 
     * @param  {jQuery.Event} e
     * @return {Boolean}
    ###
    handleKeydown: (e) =>
      if e.keyCode is 27 # Esc
        @trigger 'list:close'
        return false

      if e.keyCode is 13 or e.keyCode is 9 # Enter
        @trigger 'list:select'
        return false

      if e.keyCode is 40 # Down
        @trigger 'list:next'
        return false

      if e.keyCode is 38 # Up
        @trigger 'list:previous'
        return false
      true


  class Autocomplete

    ###*
     * Defaults, override these in any
     * extending class.
    ###
    defaults:
      listView: DropdownListView
      labelView: DropdownLabelView
      selector: ''

    ###*
     * Autocomplete
     *
     *
     * @class
     * @param {string|jQuery} el
     * @param {Backbone.Collection} collection
     * @param {object} [options] Optional object of options.
    ###
    constructor: (el, @collection, options = {}) ->
      @el = if el instanceof $ then el else $ el
      @options = _.extend options, @defaults
      @labelView = new @options.labelView
      @main()

    ###*
     * @return {Void}
    ###
    main: ->
      @el.after @labelView.$el
      
      if @el.val()
        model = new @collection.model id: @el.val()
        model.url = _.result @collection, 'url'
        model.fetch ->
          debugger



  {
    DropdownItemModel
    DropdownUrlCollection
    class: Autocomplete
  }