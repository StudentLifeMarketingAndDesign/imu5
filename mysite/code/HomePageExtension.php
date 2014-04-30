<?php

class HomePageExtension extends DataExtension {
	private static $has_many = array(
		'BackgroundFeatures' => 'BackgroundFeature',
	);

	public function updateCMSFields(FieldList $f) {
		$gridField = new GridField('BackgroundFeatures', 'Background Features', $this->owner->BackgroundFeatures(), GridFieldConfig_RelationEditor::create());
		$f->addFieldToTab('Root.Main', $gridField);
		$f->renameField('BackgroundImage', 'Background Image (only shows if there aren\'t any Background Features below)');
	}
}

class HomePage_ControllerExtension extends Extension {

	public function index(){
		$owner = $this->owner;
	
		$page = $this->owner->customise(array(
			'BackgroundFeature' => BackgroundFeature::get()->Sort('RAND()')->First()
		));

		return $page->renderWith(array('HomePage','Page'));
	}
}