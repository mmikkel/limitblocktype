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

class LimitBlockTypeController extends FieldsController
{
  
    public function redirectToPostedUrl($object = null, $default = null)
    {
        craft()->limitBlockType->saveBlockTypeLimitsFromPost($object);
        parent::redirectToPostedUrl($object, $default);
    }

}
