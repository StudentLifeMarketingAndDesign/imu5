<?php
class BuildingHoursPage extends Page {

	private static $db = array(

	);

	private static $has_many = array(
		'Departments' => 'BuildingDepartment',
	);

	private static $hide_preview_panel = true;

	public function getCMSFields(){
		$fields = parent::getCMSFields();

		//$gridFieldConfig = GridFieldConfig_RelationEditor::create(); 
		
		$gridFieldConfig = GridFieldConfig::create()
		->addComponent(new GridFieldButtonRow('before'))
		->addComponent(new GridFieldToolbarHeader())
		->addComponent(new GridFieldTitleHeader())
		->addComponent(new GridFieldEditableColumns())
		->addComponent(new GridFieldDeleteAction())
		->addComponent(new GridFieldAddNewInlineButton())
		->addComponent(new GridFieldOrderableRows('SortOrder'));

		$gridfield = new GridField("Departments", "Department", $this->Departments(), $gridFieldConfig);

		//Debug::show($gridfield->getConfig()->getComponentsByType('GridFieldAddNewInlineButton'));
		$fields->addFieldToTab('Root.Main', $gridfield, 'Content');


		return $fields;

	}

}
class BuildingHoursPage_Controller extends Page_Controller {

	
	private static $allowed_actions = array (
	);

	public function init() {
		parent::init();


	}

}