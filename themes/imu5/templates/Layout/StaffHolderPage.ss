
<div class="gradient">
      <div class="container clearfix">
            <div class="white-cover"></div>
          <section class="main-content">
            $Form
            $Content
            <% loop Teams %>
                  <h2 class="staff-title">$Title</h2>
                  <% if $GroupImage %>
                        <img src="$GroupImage.SetWidth(800).URL" alt="Group Photo of $Title" class="group-image" />
                  <% end_if %>
                  <ul class="staff-list">
                  <% loop $SortedStaffPages %>
                        <li>
                          <% if $Photo %>
                            <a href="$Link" class="staff-link">
                              <img src="$Photo.CroppedImage(350,234).URL" alt="$FirstName $LastName" class="staff-img">
                            </a>
                            <% else %>
                              <a href="$Link" class="staff-link">
                                    <img src="division-project/images/dosl.png" alt="$FirstName $LastName" class="staff-img">
                              </a>
                              <% end_if %>
                              <p class="staff-name">
                              		<% if $FirstName %>
                              			<a href="$Link">$FirstName $LastName</a>
                              		<% else %>
                                    	<a href="$Link">$Title</a>
                                    <% end_if %> 
                                    <% if $Position %><small class="staff-position">$Position</small><% end_if %>
                              </p>
                        </li>
                  <% end_loop %>
                        <li class="filler"></li>
                        <li class="filler"></li>
                  </ul>
                  
            <% end_loop %>
          </section>
          <section class="sec-content hide-print">
       
            <% include SideNav %>
          </section>
      </div>
</div>
<%-- <% include TopicsAndNews %> --%>
