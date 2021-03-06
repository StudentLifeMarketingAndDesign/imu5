<?php

use SilverStripe\Forms\DateField;

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

		$fields->addFieldToTab('Root.Main', DateField::create('EffectiveStartDate')->setHTML5(true), 'Content');
		$fields->addFieldToTab('Root.Main', DateField::create('EffectiveEndDate')->setHTML5(true), 'Content');

		return $fields;

	}

}
