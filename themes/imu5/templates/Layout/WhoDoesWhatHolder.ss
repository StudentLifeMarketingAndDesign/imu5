<% if $BackgroundImage %>
	<div class="img-container" style="background-image: url($BackgroundImage.URL);">
		<div class="img-fifty-top"></div>
	</div>
<% end_if %>
<div class="gradient">
	<div class="container clearfix">
		<div class="white-cover"></div>
	    <section class="main-content <% if $BackgroundImage %>margin-top<% end_if %>">
	    		<h1>$Title</h1>	
	    		$Content
        		<% if $CurrentTag %>
					<div class="who-does-what-selected-tag">
						
                			
						<p>
						<% _t('VIEWINGTAGGED', 'Departments tagged with') %> '<strong>$CurrentTag.Title</strong>':</p>
					</div>
				<% end_if %>
        			
				<% if $PaginatedList %>
					<% loop $PaginatedList.Sort(Title) %>		
						<section class="who-does-what-section blogSummary" id="{$URLSegment}">
						  <div class="colgroup">
							<div class="who-does-what">
							<h3>
								$MenuTitle
							</h3>
								<% if $OfficeName %><p><span>Office Name:</span> $OfficeName</p><% end_if %>
								<% if $OfficeLocation %><p><span>Location:</span> $OfficeLocation</p><% end_if %>
								<% if $PhoneNumber %><p><span>Phone Number:</span> $PhoneNumber</p><% end_if %>
								<% if $EmailAddress %><p><span>Email:</span> <a href="mailto:$EmailAddress">$EmailAddress</a></p><% end_if %>
								<% if $Website %><p><a class="btn" href="$Website" target="_blank">Visit Website</a></p><% end_if %>
							</div>						
						 </div>	
						<% if Tags %>
						    <div class="who-does-what-section-tags">
							<p>
								Tags:
								<% loop Tags %>
									<a href="$Link" title="View all posts tagged '$Title'" rel="tag">$Title</a><% if not Last %>,<% end_if %>
								<% end_loop %>
							</p>
							</div>
						<% end_if %>
					   </section>
					<hr>	
					<% end_loop %> 
					<p><a href="$Link" class="btn">View All Departments</a></p>	
				<% else %>
					<p><% _t('NOENTRIES', 'There are no departments with this tag.') %></p>
				<% end_if %>

        </section>
	    <section class="sec-content hide-print">
	    	<% include BlogSideBar %>
	    </section>
    </div>
</div>
<%-- <% include TopicsAndNews %> --%>
        
    