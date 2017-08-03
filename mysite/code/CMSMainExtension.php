<?php
class CMSMainExtension extends Extension {
    public function updateEditForm($form) {
        $classNameField = $form->Fields()->dataFieldByName('ClassName');
        if ($classNameField) {
            $className = $classNameField->Value();
            if ($className && class_exists($className) && $className::config()->hide_preview_panel)
            {
               
                $form->Fields()->removeByName(array('SilverStripeNavigator'));
                $form->removeExtraClass('cms-previewable');
            }
        }
    }
}