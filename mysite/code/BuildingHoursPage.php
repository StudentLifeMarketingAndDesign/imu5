<?php
class BuildingHoursPage extends Page {

	private static $db = array(

	);

	private static $has_many = array(
		'Departments' => 'BuildingDepartment',
	);

	static $plural_name = 'BuildingHours';

	public function getCMSFields(){
		$fields = parent::getCMSFields();

		$gridFieldConfig = GridFieldConfig_RecordEditor::create(); 
		$gridfield = new GridField("Departments", "Department", BuildingDepartment::get(), $gridFieldConfig);		
		$fields->addFieldToTab('Root.Main', $gridfield);


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