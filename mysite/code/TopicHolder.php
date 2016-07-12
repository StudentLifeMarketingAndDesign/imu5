<?php

class TopicHolder extends Blog {

	function getTopics() {


		return 'Hello';
	}
	    /**
     * @return DataList
     */
    public function getTags()
    {
        $blog = $this;

        if (!$blog) {
            return array();
        }

        $query = $blog->Tags();

        if ($this->Limit) {
            $query = $query->limit(Convert::raw2sql($this->Limit));
        }

        if ($this->Order && $this->Direction) {
            $query = $query->sort(Convert::raw2sql($this->Order), Convert::raw2sql($this->Direction));
        }

        return $query;
    }
}