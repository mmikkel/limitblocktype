<?php
/**
 * Limit Block Type plugin for Craft CMS
 *
 * LimitBlockType Service
 *
 * @author    Mats Mikkel Rummelhoff
 * @copyright Copyright (c) 2016 Mats Mikkel Rummelhoff
 * @link      http://mmikkel.no
 * @package   LimitBlockType
 * @since     1.0.0
 */

namespace Craft;

class LimitBlockTypeService extends BaseApplicationComponent
{

    protected $cacheKey = 'blocktypelimits';
    
    public function getData() 
    {
      
      $data = !craft()->config->get('devMode') ? craft()->fileCache->get($this->cacheKey) : null;
      
      if (!$data) {
        
        $records = LimitBlockTypeRecord::model()->findAll();
        $data = [];

        $matrixFieldHandles = [];
        $matrixBlockHandles = [];
        
        foreach ($records as $record) {
          
          $fieldId = $record->fieldId;
          $typeId = $record->typeId;
          $limit = $record->limit ? (int) $record->limit : null;

          if (!isset($matrixFieldHandles[$fieldId])) {
            $matrixField = craft()->fields->getFieldById($fieldId);
            $matrixFieldHandles[$fieldId] = $matrixField->handle;
            $matrixBlocks = craft()->matrix->getBlockTypesByFieldId($fieldId);
            foreach ($matrixBlocks as $matrixBlock) {
              $matrixBlockHandles[$matrixBlock->id] = $matrixBlock->handle;
            }
          }

          $matrixFieldHandle = $matrixFieldHandles[$fieldId].':'.$fieldId;

          if (!isset($data[$matrixFieldHandle])) {
            $data[$matrixFieldHandle] = [];
          }

          $matrixBlockHandle = $matrixBlockHandles[$typeId].':'.$typeId;
          
          $data[$matrixFieldHandle][$matrixBlockHandle] = $limit;

        }

        craft()->fileCache->set($this->cacheKey, $data, 1800); // Cache for 30 minutes

      }
      
      return $data;

    }

    public function saveBlockTypeLimitsFromPost(FieldModel $field)
    {
      
      $vars = craft()->request->getPost();

      $matrixFieldBlockTypes = craft()->matrix->getBlockTypesByFieldId($field->id);
      $postedBlockTypes = $vars['types']['Matrix']['blockTypes'] ?: null;

      if (!$postedBlockTypes || empty($postedBlockTypes) || !$matrixFieldBlockTypes || empty($matrixFieldBlockTypes)) {
        return false;
      }

      $postedBlockTypesByHandle = [];

      foreach ($postedBlockTypes as $blockType) {
        $postedBlockTypesByHandle[$blockType['handle']] = $blockType;
      }

      foreach ($matrixFieldBlockTypes as $blockType) {
        $limit = @$postedBlockTypesByHandle[$blockType->handle]['limit'] ?: null;
        $this->saveLimitForBlockType($blockType, $field, $limit);
      }

    }

    public function saveLimitForBlockType(MatrixBlockTypeModel $blockType, FieldModel $field, $limit)
    {

      $attributes = [
        'fieldId' => $field->id,
        'typeId' => $blockType->id,
      ];

      $record = LimitBlockTypeRecord::model()->findByAttributes($attributes);

      if (!$record) {
        $record = new LimitBlockTypeRecord();
      }

      $attributes['limit'] = $limit;

      $record->setAttributes($attributes);

      //$record->validate();

      // TODO: Create a model to validate errors on

      $transaction = craft()->db->getCurrentTransaction() === null ? craft()->db->beginTransaction() : null;

      try {

        if (!$record->id) {
          $record->save();
        } else {
          $record->update();
        }

        if ($transaction !== null) {
          $transaction->commit();
        }

      } catch (\Exception $error) {

        if ($transaction !== null) {
          $transaction->rollback();
        }

        throw $error;

      }

      craft()->fileCache->delete($this->cacheKey);

    }

}