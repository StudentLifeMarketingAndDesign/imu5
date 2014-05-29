<?php

class AfterClassCategoryDropdownField extends DropdownField {
	private $feedBase = 'http://afterclass.uiowa.edu';
	//private $feedBase = 'http://baltar.imu.uiowa.edu:8888/after-class';

	private static $default_category = 0;

	protected $extraClasses = array('dropdown');


	public function __construct($name, $title = null, $source = null, $value = "", $form=null) {

		$feedURL = $this->feedBase.'/events/categories/feed/json';
		$rawFeed = file_get_contents($feedURL);
		$categoriesArray = json_decode($rawFeed, TRUE);

		foreach($categoriesArray['categories'] as $key => $category){
			$source[$category['id']] = $category['title'];
		}

		parent::__construct($name, ($title===null) ? $name : $title, $source, $value, $form);
		$this->setEmptyString('(No Category)');
	}

	public function Field($properties = array()) {
		return parent::Field();
	}
}
