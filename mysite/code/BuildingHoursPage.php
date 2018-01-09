<?php
class BuildingHoursPage extends Page {

	private static $db = array(

		'EffectiveStartDate' => 'Date',
		'EffectiveEndDate' => 'Date'

	);

	private static $has_many = array(
	
	);

	private static $allowed_children = array(
		'BuildingDepartment'
	);

	private static $hide_preview_panel = true;

	public function getCMSFields(){
		$fields = parent::getCMSFields();
		$fields->removeByName('LayoutType');
		$fields->removeByName('BackgroundImage');

		$fields->addFieldToTab('Root.Main', DateField::create('EffectiveStartDate')->setConfig('showcalendar', true), 'Content');
		$fields->addFieldToTab('Root.Main', DateField::create('EffectiveEndDate')->setConfig('showcalendar', true), 'Content');

		return $fields;

	}

}
class BuildingHoursPage_Controller extends Page_Controller {

	
	private static $allowed_actions = array (
		'edit'
	);

	private static $url_handlers = array(
		'edit//' => 'edit'
	);
	public function edit(){
		return $this->renderWith(array('BuildingHoursPage_edit', 'Page'));
	}
	public function init() {
		parent::init();


	}

}