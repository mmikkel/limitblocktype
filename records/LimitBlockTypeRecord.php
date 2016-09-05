<?php
/**
 * Limit Block Type plugin for Craft CMS
 *
 * LimitBlockType Record
 *
 * @author    Mats Mikkel Rummelhoff
 * @copyright Copyright (c) 2016 Mats Mikkel Rummelhoff
 * @link      http://mmikkel.no
 * @package   LimitBlockType
 * @since     1.0.0
 */

namespace Craft;

class LimitBlockTypeRecord extends BaseRecord
{
    /**
     * @return string
     */
    public function getTableName()
    {
        return 'limitblocktype';
    }

    /**
     * @access protected
     * @return array
     */
   protected function defineAttributes()
    {
        return array(
            'fieldId'   => AttributeType::Number,
            'typeId'    => AttributeType::Number,
            'limit'     => AttributeType::Number
        );
    }

    /**
     * @return array
     */
    public function defineRelations()
    {
        return array(
            'field' => array(
                static::BELONGS_TO,
                'FieldRecord',
                'fieldId',
                'onDelete' => static::CASCADE,
            ),
            'matrixBlockType' => array(
                static::BELONGS_TO,
                'MatrixBlockTypeRecord',
                'typeId',
                'onDelete' => static::CASCADE,
            ),
        );
    }
}