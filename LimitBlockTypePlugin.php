<?php
/**
 * Limit Block Type plugin for Craft CMS
 *
 * Adds option to limit individual Matrix block types
 *
 * @author    Mats Mikkel Rummelhoff
 * @copyright Copyright (c) 2016 Mats Mikkel Rummelhoff
 * @link      http://mmikkel.no
 * @package   LimitBlockType
 * @since     1.0.0
 */

namespace Craft;

class LimitBlockTypePlugin extends BasePlugin
{

    protected $_version = '1.0.0';
    protected $_schemaVersion = '1.0';
    protected $_developer = 'Mats Mikkel Rummelhoff';
    protected $_developerUrl = 'http://mmikkel.no';
    protected $_pluginName = 'Limit Block Type';
    protected $_pluginUrl = 'https://github.com/mmikkel/limitblocktype';
    protected $_releaseFeedUrl = 'https://raw.githubusercontent.com/mmikkel/limitblocktype/master/releases.json';
    protected $_documentationUrl = 'https://github.com/mmikkel/limitblocktype/blob/master/README.md';
    protected $_description = 'Adds option to limit individual Matrix block types';
    protected $_minVersion = '2.6';

    /**
     * @return mixed
     */
    public function init()
    {
        
        if (!craft()->request->isCpRequest() || craft()->isConsole()) {
            return false;
        }

        $isAjaxRequest = craft()->request->isAjaxRequest();
        $segments = craft()->request->segments;
        $actionSegment = array_pop($segments) ?: '';

        if (!$isAjaxRequest) {
            
            craft()->templates->includeJsResource('limitblocktype/js/limitblocktype.js');
            
            // Check request parameters
            $vars = craft()->request->getPost();
            if (!empty($vars) && $vars['action'] === 'fields/saveField' && $vars['type'] === 'Matrix') {
                // This is so hacky I don't even
                craft()->runController('limitBlockType/saveField');
            }

        }

        if (!$isAjaxRequest || $actionSegment === 'getEditorHtml') {
            $data = JsonHelper::encode(craft()->limitBlockType->getData());
            craft()->templates->includeJs('if (Craft && Craft.LimitBlockTypePlugin) { new Craft.LimitBlockTypePlugin('.$data.', '.($isAjaxRequest ? '1' : '0').'); }');
        }

    }

    /**
     * @return mixed
     */
    public function getName()
    {
         return Craft::t($this->_pluginName);
    }

    /**
     * @return mixed
     */
    public function getDescription()
    {
        return Craft::t($this->_description);
    }

    /**
     * @return string
     */
    public function getPluginUrl()
    {
        return $this->_pluginUrl;
    }

    /**
     * @return string
     */
    public function getDocumentationUrl()
    {
        return $this->_documentationUrl;
    }

    /**
     * @return string
     */
    public function getReleaseFeedUrl()
    {
        return $this->_releaseFeedUrl;
    }

    /**
     * @return string
     */
    public function getVersion()
    {
        return $this->_version;
    }

    /**
     * @return string
     */
    public function getSchemaVersion()
    {
        return $this->_schemaVersion;
    }

    /**
     * @return string
     */
    public function getDeveloper()
    {
        return $this->_developer;
    }

    /**
     * @return string
     */
    public function getDeveloperUrl()
    {
        return $this->_developerUrl;
    }

    /**
     * @return bool
     */
    public function hasCpSection()
    {
        return false;
    }

    /**
     */
    public function onBeforeInstall()
    {
        if (!$this->isCraftRequiredVersion()) {
            craft()->userSession->setError(Craft::t('{pluginName} requires Craft {minVersion} or newer, and was not installed.', array(
                    'pluginName' => $this->getName(),
                    'minVersion' => $this->getCraftRequiredVersion(),
            )));
            return false;
        }
    }

    /**
     */
    public function onAfterInstall()
    {
    }

    /**
     */
    public function onBeforeUninstall()
    {
    }

    /**
     */
    public function onAfterUninstall()
    {
    }

    /**
     * @return string
     */
    public function getCraftRequiredVersion()
    {
        return $this->_minVersion;
    }

    /**
     * @return mixed
     */
    public function isCraftRequiredVersion()
    {
        return version_compare(craft()->getVersion(), $this->getCraftRequiredVersion(), '>=');
    }

}