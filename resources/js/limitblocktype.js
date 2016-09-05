/*
*   Limit Block Type plugin
*
*/
Craft.LimitBlockTypePlugin = Garnish.Base.extend({

    init: function(data, isAjaxRequest) {

        if (Craft.MatrixConfigurator) {
            new Craft.LimitBlockTypePlugin_Configurator(data, isAjaxRequest);
        }
        if (Craft.MatrixInput) {
            new Craft.LimitBlockTypePlugin_Input(data, isAjaxRequest);
        }
    }

});

Craft.LimitBlockTypePlugin_Configurator = Garnish.Base.extend({

    data: null,
    configurator: null,

    init: function (data) {

        this.data = this.getData(data || {});

        var self = this;
        
        var init = Craft.MatrixConfigurator.prototype.init;
        Craft.MatrixConfigurator.prototype.init = function () {
            init.apply(this, arguments);
            self.configurator = this;
            self.patchBlockTypes(this.blockTypes);
        }

        // Add the "Max blocks" setting to the block type settings modal
        var getBlockTypeSettingsModal = Craft.MatrixConfigurator.prototype.getBlockTypeSettingsModal;
        Craft.MatrixConfigurator.prototype.getBlockTypeSettingsModal = function () {
            
            if (!this.blockTypeSettingsModal) {
                
                var blockTypeSettingsModal = getBlockTypeSettingsModal.apply(this, arguments);
                blockTypeSettingsModal.$limitField = $('<div class="field"/>');
                blockTypeSettingsModal.$limitHeading = $('<div class="heading"/>').appendTo(blockTypeSettingsModal.$limitField);
                blockTypeSettingsModal.$limitLabel = $('<label for="new-block-type-handle">'+Craft.t('Max blocks')+'</label>').appendTo(blockTypeSettingsModal.$limitHeading);
                blockTypeSettingsModal.$limitInstructions = $('<div class="instructions"><p>'+Craft.t('The maximum number of blocks allowed for this block type')+'</p></div>').appendTo(blockTypeSettingsModal.$limitHeading);
                blockTypeSettingsModal.$limitInputContainer = $('<div class="input"/>').appendTo(blockTypeSettingsModal.$limitField);
                blockTypeSettingsModal.$limitInput = $('<input type="text" class="text fullwidth code" size="3" id="new-block-type-limit"/>').appendTo(blockTypeSettingsModal.$limitInputContainer);
                blockTypeSettingsModal.$handleField.after(blockTypeSettingsModal.$limitField);
                
                var show = blockTypeSettingsModal.show;
                blockTypeSettingsModal.show = function (name, handle, limit, errors) {
                    this.$limitInput.val(typeof limit == 'string' ? limit : '');
                    show.apply(this, arguments);
                }
                
                blockTypeSettingsModal.onFormSubmit = function(ev)
                {
                    ev.preventDefault();
    
                    // Prevent multi form submits with the return key
                    if (!this.visible)
                    {
                        return;
                    }

                    if (this.handleGenerator.listening)
                    {
                        // Give the handle a chance to catch up with the input
                        this.handleGenerator.updateTarget();
                    }

                    // Basic validation
                    var name = Craft.trim(this.$nameInput.val()),
                        handle = Craft.trim(this.$handleInput.val()),
                        limit = Craft.trim(this.$limitInput.val());

                    if (!name || !handle)
                    {
                        Garnish.shake(this.$form);
                    }
                    else
                    {
                        this.hide();
                        this.onSubmit(name, handle, limit);
                    }
                };
                blockTypeSettingsModal.removeListener(blockTypeSettingsModal.$form, 'submit');
                blockTypeSettingsModal.addListener(blockTypeSettingsModal.$form, 'submit', 'onFormSubmit');
                this.blockTypeSettingsModal = blockTypeSettingsModal;
            }
            return this.blockTypeSettingsModal;
        }

        /*
        *   For the new blocks on the block
        *
        */
        var addBlockType = Craft.MatrixConfigurator.prototype.addBlockType;
        var self = this;
        Craft.MatrixConfigurator.prototype.addBlockType = function () {
            addBlockType.apply(this, arguments);
            var superSubmit = this.blockTypeSettingsModal.onSubmit;
            this.blockTypeSettingsModal.onSubmit = (function (name, handle) {
                var limit = parseInt(this.$limitInput.val()) || null;
                superSubmit(name, handle);
                self.patchBlockTypes(self.configurator.blockTypes);
                var newBlockId = 'new'+self.configurator.totalNewBlockTypes;
                self.configurator.blockTypes[newBlockId].applySettings(name, handle, limit);
                self.setData({blockId: newBlockId, limit: limit});
            }).bind(this.blockTypeSettingsModal);
        }

    },

    getData: function (data) {
        // For the configurator, we just need the block ids and limits
        var temp = {};
        for (var i in data) {
            for (var j in data[i]) {
                temp[j.split(':')[1]] = data[i][j];
            }
        }
        return $.extend(temp, Craft.getLocalStorage('limitblocktypesdata') || {});
    },

    // Store in localStorage, to retain temporary values when the form fails to submit
    setData: function (data) {
        var blockId = data.blockId || null;
        var limit = data.limit || null;
        if (blockId === null || limit === null) {
            return false;
        }
        this.data[blockId] = limit;
        Craft.setLocalStorage('limitblocktypesdata', this.data);
    },

    patchBlockTypes: function(blockTypes) {
        
        for (var id in blockTypes) {
            
            var blockType = blockTypes[id];
            var self = this;
            
            if (!blockType.$limitHiddenInput) {
                
                blockType.$limitHiddenInput = $('<input class="hidden" name="types[Matrix][blockTypes]['+id+'][limit]" value="'+(this.getLimitForBlockTypeId(id)||'')+'" />');
                blockType.$handleHiddenInput.after(blockType.$limitHiddenInput);

                var superApplySettings = blockType.applySettings;
                blockType.applySettings = function (name, handle, limit) {
                    limit = parseInt(limit) || null;
                    this.$limitHiddenInput.val(limit);
                    self.setData({blockId: this.id, limit: limit});
                    superApplySettings.apply(this, arguments);
                };
                
                blockType.showSettings = (function () {
                    var blockTypeSettingsModal = this.configurator.getBlockTypeSettingsModal();
                    blockTypeSettingsModal.show(this.$nameHiddenInput.val(), this.$handleHiddenInput.val(), this.$limitHiddenInput.val(), this.errors);
                    blockTypeSettingsModal.onSubmit = this.applySettings.bind(this);
                    blockTypeSettingsModal.onDelete = $.proxy(this, 'selfDestruct');
                }).bind(blockType);

                blockType.removeListener(blockType.$settingsBtn, 'click');
                blockType.addListener(blockType.$settingsBtn, 'click', 'showSettings');

                this.configurator.blockTypes[id] = blockType;

            }
        }

    },

    getLimitForBlockTypeId: function (blockTypeId) {
        return this.data[blockTypeId] || null;
    }

});

Craft.LimitBlockTypePlugin_Input = Garnish.Base.extend({

    $context: null,
    data: null,
    fields: {},
    disabledBlockTypes: [],

    init: function (data, isAjaxRequest) {

        if (isAjaxRequest) {
            this.context = '.body.elementeditor:last';
        } else {
            this.context = '#fields';
        }

        this.data = data || {};
        
        var self = this;
        var init = Craft.MatrixInput.prototype.init;
        
        Craft.MatrixInput.prototype.init = function () {

            init.apply(this, arguments);

            var fieldHandle = this.id.split('-').pop();
            var fieldData = self.getFieldDataByHandle(fieldHandle);
            var blockData = {};

            for (var i in fieldData) {
                blockData[i.split(':')[0]] = {
                    id: i.split(':')[1],
                    limit: fieldData[i]
                };
            }

            self.fields[fieldHandle] = {
                instance: this,
                blockData: blockData
            };

            this.removeListener(this.$addBlockBtnGroupBtns, 'click');
            this.addListener(this.$addBlockBtnGroupBtns, 'click', function(ev) {
                var type = $(ev.target).data('type');
                var fieldHandle = this.id.split('-').pop();
                this.addBlock(type, fieldHandle);
            });

            self.patchField(fieldHandle);

        }

        var addBlock = Craft.MatrixInput.prototype.addBlock;
        Craft.MatrixInput.prototype.addBlock = function (type, $insertBefore) {
            var fieldHandle;
            var args;
            if (typeof $insertBefore == 'string') {
                fieldHandle = $insertBefore;
                args = [arguments[0]]
            } else if ($insertBefore && $insertBefore.length) {
                fieldHandle = $insertBefore.closest('.matrix.matrix-field').attr('id').split('-')[1] || null;
                args = arguments;
            } else {
                fieldHandle = self.activeMatrixFieldHandle || null;
                args = [arguments[0]];
            }
            if (fieldHandle) {
                // Is this block type limited for this field?
                var fieldData = self.fields[fieldHandle] || null;
                if (fieldData && $.inArray(type, (fieldData.disabledBlockTypes||[])) >= 0) {
                    return false;    
                }
            }
            addBlock.apply(this, args);
            self.patchField(fieldHandle);
        }

        var updateAddBlockBtn = Craft.MatrixInput.prototype.updateAddBlockBtn;
        Craft.MatrixInput.prototype.updateAddBlockBtn = function () {
            updateAddBlockBtn.apply(this, arguments);
            Garnish.requestAnimationFrame((function () {
                this.patchFields();
            }).bind(self));
        }

        var setNewBlockBtn = Craft.MatrixInput.prototype.setNewBlockBtn;
        Craft.MatrixInput.prototype.setNewBlockBtn = function () {
            setNewBlockBtn.apply(this, arguments);
            Garnish.requestAnimationFrame((function () {
                this.patchFields();
            }).bind(self));
        }

        $('body').on('click', '.matrix.matrix-field', (function (e) {
            this.activeMatrixFieldHandle = $(e.currentTarget).attr('id').split('-').pop();
        }).bind(this));
        $('body').on('click', '.matrixblock .actions a.settings', this.onBlockSettingsBtnClick.bind(this));
        $('body').on('click', '.matrix.matrix-field .buttons .btn.add', this.onBlockSettingsBtnClick.bind(this));

    },

    getFieldDataByHandle: function (handle) {
        for (var i in this.data) {
            if (i.split(':')[0] === handle) {
                return this.data[i];
            }
        }
        return null;
    },

    onBlockSettingsBtnClick: function (e) {
        $('.menu:last a[data-type]').removeClass('disabled');
        Garnish.requestAnimationFrame((function () {
            this.patchFields();
        }).bind(this));
    },

    patchFields: function () {
        if (this.activeMatrixFieldHandle) {
            this.patchField(this.activeMatrixFieldHandle);
        } else {
            for (var fieldHandle in this.fields) {
                this.patchField(fieldHandle);
            }
        }
    },

    patchField: function (fieldHandle) {

        if (!this.fields[fieldHandle]) {
            return false;
        }

        var self = this;
        var instance = this.fields[fieldHandle].instance;
        var blockData = this.fields[fieldHandle].blockData;
        var $field = instance.$container;
        var $addBlockMenuBtn = instance.$addBlockMenuBtn;
        var $addBlockBtnGroupBtns = instance.$addBlockBtnGroupBtns;

        this.fields[fieldHandle].disabledBlockTypes = [];

        $addBlockBtnGroupBtns.each(function () {
            
            var $btn = $(this);
            var blockTypeHandle = $btn.data('type');

            if (!blockData[blockTypeHandle]) {
                return;
            }

            var blockTypeId = blockData[blockTypeHandle].id;
            var blockTypeLimit = blockData[blockTypeHandle].limit || null;
            var blockTypeCount = $field.find('.matrixblock[data-id] > input[type="hidden"][value="'+blockTypeHandle+'"]').length;

            var $menuBtn = $('.menu:last a[data-type="'+blockTypeHandle+'"]');

            if (blockTypeLimit && blockTypeCount >= blockTypeLimit) {
                $btn.addClass('disabled');
                if ($menuBtn.length) {
                    $menuBtn.addClass('disabled');
                }
                self.fields[fieldHandle].disabledBlockTypes.push(blockTypeHandle);
            } else {
                $btn.removeClass('disabled');
                if ($menuBtn.length) {
                    $menuBtn.removeClass('disabled');
                }
            }
        });

    },

    getLimitForBlockTypeHandle: function (blockTypeHandle) {
        var limit = null;
        for (var i in this.data) {
            if (this.data[i].handle === blockTypeHandle) {
                return this.data[i].limit || null;
            }
        }
        return null;
    },

    getBlockTypeIdByHandle: function (blockTypeHandle) {
        for (var id in this.data) {
            if (this.data[id].handle === blockTypeHandle) {
                return id;
            }
        }
        return null;
    }

});

$(function () {
    if (!$('input[type="hidden"][name="action"][value="fields/saveField"]').length) {
        Craft.setLocalStorage('limitblocktypesdata', null);
    }
});