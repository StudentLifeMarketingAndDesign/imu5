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
				<% if SelectedTag %>
					<p><a href="$Link">View All Departments</a></p>	
					<div class="who-does-what-selected-tag">
						<h2>
						<% _t('VIEWINGTAGGED', 'Departments tagged with') %> '$SelectedTag': </h2>
					</div>
					<hr />
				<% end_if %>				
				<% if $BlogEntries %>
					<% loop $BlogEntries.Sort(Title) %>		
						<section class="who-does-what-section blogSummary" id="{$URLSegment}">
						  <div class="colgroup">
							<div class="who-does-what col-1-2">
							<h3>
								$MenuTitle
							</h3>
								<% if $OfficeName %><p><span>Office Name:</span> $OfficeName</p><% end_if %>
								<% if $OfficeLocation %><p><span>Location:</span> $OfficeLocation</p><% end_if %>
								<% if $PhoneNumber %><p><span>Phone Number:</span> $PhoneNumber</p><% end_if %>
								<% if $EmailAddress %><p><span>Email:</span> $EmailAddress </p><% end_if %>
								<% if $Website %><p><a href="$Website">Visit Website</a></p><% end_if %>
							</div>						
							<div class="who-does-what additional-info col-1-2">
								<% if $AdditionalInfo %>
								<p> $AdditionalInfo </p>
								<% end_if %>
							</div>
						 </div>	
						<% if TagsCollection %>
						    <div class="who-does-what-section-tags">
							<p>
								Tags:
								<% loop TagsCollection %>
									<a href="$Link" title="View all posts tagged '$Tag'" rel="tag">$Tag</a><% if not Last %>,<% end_if %>
								<% end_loop %>
							</p>
							</div>
						<% end_if %>
					   </section>
					<hr>	
					<% end_loop %> 
				<% else %>
					<p><% _t('NOENTRIES', 'There are no departments with this tag.') %></p>
				<% end_if %>
        </section>
        <aside class="sec-content hide-print">
        	<% include SideBarSearch %>
        	<% include SideNav %>
        	<div id="sidebar-tags">
        	$SideBarView
        	</div>
        </aside>
    </div>
</div>
<%-- <% include TopicsAndNews %> --%>
        
    