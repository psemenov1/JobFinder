document.addEventListener("DOMContentLoaded", function () {
    const navButtons = document.querySelectorAll(".nav-btn");
    const contentSections = document.querySelectorAll(".content-section");

    // Navigation functionality
    navButtons.forEach(button => {
        button.addEventListener("click", function () {
            contentSections.forEach(section => section.style.display = "none");
            document.getElementById(button.dataset.target).style.display = "block";
        });
    });

    // Load saved user data
    const userData = JSON.parse(localStorage.getItem("userData")) || {};
    document.getElementById("name").value = userData.name || "";
    document.getElementById("school").value = userData.school || "";
    document.getElementById("degree").value = userData.degree || "";
    document.getElementById("location").value = userData.location || "";
    document.getElementById("job-type").value = userData.jobType || "fulltime";
    document.getElementById("experience-level").value = userData.experience || "entry";

    const skills = userData.skills ? userData.skills.split(",") : [];
    const skillList = document.getElementById("skill-list");
    const skillInput = document.getElementById("skill-input");
    const addSkillBtn = document.getElementById("add-skill-btn");

    function updateSkillList() {
        skillList.innerHTML = "";
        skills.forEach((skill, index) => {
            const li = document.createElement("li");
            li.textContent = skill;
            const removeBtn = document.createElement("button");
            removeBtn.textContent = "Remove";
            removeBtn.onclick = function () {
                skills.splice(index, 1);
                updateSkillList();
                saveUserData();
            };
            li.appendChild(removeBtn);
            skillList.appendChild(li);
        });
    }

    addSkillBtn.addEventListener("click", function () {
        const skill = skillInput.value.trim();
        if (skill && skills.length < 15 && !skills.includes(skill)) {
            skills.push(skill);
            updateSkillList();
            saveUserData();
            skillInput.value = "";
        }
    });

    updateSkillList();

    // Save user data
    function saveUserData() {
        const userData = {
            name: document.getElementById("name").value.trim(),
            school: document.getElementById("school").value.trim(),
            degree: document.getElementById("degree").value.trim(),
            location: document.getElementById("location").value.trim().replace(/\s+/g, "+"),
            jobType: document.getElementById("job-type").value,
            experience: document.getElementById("experience-level").value,
            skills: skills.map(skill => skill.trim()).join(",") // Convert skills to a comma-separated string
        };
        localStorage.setItem("userData", JSON.stringify(userData));
    }    

    document.getElementById("clear-data").addEventListener("click", function () {
        localStorage.clear();
        location.reload();
    });

    // Job Search API Integration
    document.getElementById("search-jobs").addEventListener("click", function () {
        const userData = JSON.parse(localStorage.getItem("userData")) || {};

        const location = userData.location || "";
        const jobType = userData.jobType || "fulltime";
        const experience = userData.experience || "entry";
        const skills = userData.skills || "";

        // Format skills for API query (convert comma-separated skills into a search-friendly string)
        const formattedSkills = skills.replace(/\s+/g, "+");

        // Format location properly for API
        const formattedLocation = location.trim().replace(/\s+/g, "+");

        // API Credentials
        const APP_ID = "4ecaa92c";
        const API_KEY = "90a96b30771ce99d58a88e84a429b3cd";

        // Construct the API URL with user inputs
        const API_URL = `https://api.adzuna.com/v1/api/jobs/us/search/1?app_id=${APP_ID}&app_key=${API_KEY}&results_per_page=10&where=${encodeURIComponent(formattedLocation)}&what=${encodeURIComponent(formattedSkills)}&full_time=${jobType === "fulltime" ? "1" : "0"}&part_time=${jobType === "parttime" ? "1" : "0"}&contract=${jobType === "contract" ? "1" : "0"}&intern=${jobType === "internship" ? "1" : "0"}&graduate=${experience === "entry" ? "1" : "0"}`;

        // Fetch job data from the API
        fetch(API_URL)
            .then(response => response.json())
            .then(data => {
                const jobResultsDiv = document.getElementById("jobResults");
                jobResultsDiv.innerHTML = ""; // Clear previous results

                if (!data.results || data.results.length === 0) {
                    jobResultsDiv.innerHTML = "<p>No jobs found. Try different skills or locations.</p>";
                    return;
                }

                // Display job results
                data.results.forEach(job => {
                    const jobElement = document.createElement("div");
                    jobElement.classList.add("job-item");
                    jobElement.innerHTML = `
                        <h3>${job.title}</h3>
                        <p><strong>Company:</strong> ${job.company.display_name}</p>
                        <p><strong>Location:</strong> ${job.location.display_name}</p>
                        <p><strong>Salary:</strong> ${job.salary_min ? `$${job.salary_min}` : "Not listed"}</p>
                        <a href="${job.redirect_url}" target="_blank">View Job</a>
                        <button class="save-job">Save Job</button>
                    `;
                    jobResultsDiv.appendChild(jobElement);
                });

                // Add event listeners to save job buttons
                document.querySelectorAll(".save-job").forEach(button => {
                    button.addEventListener("click", function () {
                        const jobInfo = this.parentElement.innerHTML;
                        saveJob(jobInfo);
                    });
                });
            })
            .catch(error => {
                console.error("Error fetching jobs:", error);
                document.getElementById("jobResults").innerHTML = `<p style="color:red;">Failed to load jobs. Check API credentials or internet connection.</p>`;
            });
    });

    function saveJob(jobInfo) {
        let savedJobs = JSON.parse(localStorage.getItem("savedJobs")) || [];
        savedJobs.push(jobInfo);
        localStorage.setItem("savedJobs", JSON.stringify(savedJobs));
        alert("Job saved!");
    }
});