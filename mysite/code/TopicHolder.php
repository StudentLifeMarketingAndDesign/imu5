<?php

class TopicHolder extends Blog {

	private static $db = array(

	);

	private static $allowed_children = array('Topic');
	public function getCMSFields(){
		$fields = parent::getCMSFields();
		//$fields->addFieldToTab("Root.Settings", new CheckboxField('ExpandAllTopicsByDefault', 'Expand all topics by default'));

		return $fields;

	}
    public function AllTags()
    {
        //$blog = $this;
        $tags = BlogTag::get()->filter(array('BlogID' => $this->ID))->sort('Title ASC');

        return $tags;
    }


}


class TopicHolder_Controller extends Blog_Controller{



}