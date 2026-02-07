let examCounter = 0;
        let timeSlotCounter = 3;

        // Timer variables
        let timerInterval = null;
        let timerSeconds = 0;
        let isTimerRunning = false;
        let isPaused = false;
        let currentSessionId = null;
        
        // Study tracking data (stored in localStorage)
        let studyData = {
            sessions: [],
            completedSessions: [],
            totalMinutesStudied: 0,
            streak: 0,
            lastStudyDate: null
        };

        // Load study data from localStorage
        function loadStudyData() {
            const saved = localStorage.getItem('studyPlannerData');
            if (saved) {
                studyData = JSON.parse(saved);
            }
        }

        // Save study data to localStorage
        function saveStudyData() {
            localStorage.setItem('studyPlannerData', JSON.stringify(studyData));
        }

        // Initialize on page load
        loadStudyData();

        // Set minimum date to today
        document.addEventListener('DOMContentLoaded', function() {
            const today = new Date().toISOString().split('T')[0];
            document.querySelectorAll('.exam-date').forEach(input => {
                input.min = today;
            });

            // Add event listeners for time inputs
            updateAllDurations();
            document.querySelectorAll('.start-time, .end-time').forEach(input => {
                input.addEventListener('change', function() {
                    updateDuration(this.closest('.time-slot-item'));
                });
            });
        });

        function updateDuration(slotItem) {
            const startTime = slotItem.querySelector('.start-time').value;
            const endTime = slotItem.querySelector('.end-time').value;
            const durationDisplay = slotItem.querySelector('.duration-display');
            
            if (startTime && endTime) {
                const start = new Date(`2000-01-01T${startTime}`);
                const end = new Date(`2000-01-01T${endTime}`);
                const diffMs = end - start;
                const diffMinutes = diffMs / (1000 * 60);
                
                if (diffMinutes > 0) {
                    const hours = Math.floor(diffMinutes / 60);
                    const minutes = Math.round(diffMinutes % 60);
                    
                    let durationText = '';
                    if (hours > 0 && minutes > 0) {
                        durationText = `${hours} hr ${minutes} min`;
                    } else if (hours > 0) {
                        durationText = `${hours} hr`;
                    } else {
                        durationText = `${minutes} min`;
                    }
                    
                    durationDisplay.textContent = durationText;
                    durationDisplay.style.color = '#28a745';
                } else {
                    durationDisplay.textContent = 'Invalid time';
                    durationDisplay.style.color = '#dc3545';
                }
            }
        }

        function updateAllDurations() {
            document.querySelectorAll('.time-slot-item').forEach(item => {
                updateDuration(item);
            });
        }

        function addTimeSlot() {
            timeSlotCounter++;
            const container = document.getElementById('timeSlotSettings');
            const newSlot = document.createElement('div');
            newSlot.className = 'time-slot-item';
            
            newSlot.innerHTML = `
                <label>Slot ${timeSlotCounter}:</label>
                <div class="time-inputs">
                    <input type="time" class="start-time" value="10:00">
                    <span>to</span>
                    <input type="time" class="end-time" value="12:00">
                </div>
                <span class="duration-display">2 hr</span>
                <button class="btn-remove-slot" onclick="removeTimeSlot(this)">Remove</button>
            `;
            
            container.appendChild(newSlot);
            
            // Add event listeners to new time inputs
            newSlot.querySelectorAll('.start-time, .end-time').forEach(input => {
                input.addEventListener('change', function() {
                    updateDuration(this.closest('.time-slot-item'));
                });
            });
            
            updateDuration(newSlot);
            updateTimeSlotLabels();
        }

        function removeTimeSlot(button) {
            button.closest('.time-slot-item').remove();
            updateTimeSlotLabels();
        }

        function updateTimeSlotLabels() {
            const slots = document.querySelectorAll('.time-slot-item');
            slots.forEach((slot, index) => {
                slot.querySelector('label').textContent = `Slot ${index + 1}:`;
                const removeBtn = slot.querySelector('.btn-remove-slot');
                if (slots.length > 1) {
                    removeBtn.style.visibility = 'visible';
                } else {
                    removeBtn.style.visibility = 'hidden';
                }
            });
        }

        function getCustomTimeSlots() {
            const slots = [];
            document.querySelectorAll('.time-slot-item').forEach(item => {
                const startTime = item.querySelector('.start-time').value;
                const endTime = item.querySelector('.end-time').value;
                
                if (startTime && endTime) {
                    const start = new Date(`2000-01-01T${startTime}`);
                    const end = new Date(`2000-01-01T${endTime}`);
                    const diffMs = end - start;
                    const diffMinutes = diffMs / (1000 * 60);
                    
                    if (diffMinutes > 0) {
                        // Convert to 12-hour format
                        const formatTime = (time24) => {
                            const [hours, minutes] = time24.split(':');
                            const h = parseInt(hours);
                            const period = h >= 12 ? 'PM' : 'AM';
                            const h12 = h % 12 || 12;
                            return `${h12}:${minutes} ${period}`;
                        };
                        
                        slots.push({
                            timeSlot: `${formatTime(startTime)} - ${formatTime(endTime)}`,
                            durationMinutes: diffMinutes
                        });
                    }
                }
            });
            
            return slots;
        }

        function handleTopicEnter(event, input) {
            if (event.key === 'Enter') {
                event.preventDefault();
                addTopic(input.nextElementSibling);
            }
        }

        function addTopic(button) {
            const topicEntry = button.closest('.topic-entry');
            const input = topicEntry.querySelector('.topic-input');
            const topicText = input.value.trim();
            
            if (!topicText) {
                alert('Please enter a topic name');
                return;
            }

            const topicList = button.closest('.topics-section').querySelector('.topic-list');
            
            const topicTag = document.createElement('span');
            topicTag.className = 'topic-tag';
            topicTag.innerHTML = `
                ${topicText}
                <button class="remove-topic" onclick="removeTopic(this)">×</button>
            `;
            
            topicList.appendChild(topicTag);
            input.value = '';
            input.focus();
        }

        function removeTopic(button) {
            button.closest('.topic-tag').remove();
        }

        function generateSchedule() {
            const entries = document.querySelectorAll('.exam-entry');
            const exams = [];
            
            // Get custom time slots
            const customTimeSlots = getCustomTimeSlots();
            
            if (customTimeSlots.length === 0) {
                alert('Please add at least one valid time slot in your study preferences.');
                return;
            }
            
            // Collect exam data
            entries.forEach(entry => {
                const subject = entry.querySelector('.subject-name').value.trim();
                const date = entry.querySelector('.exam-date').value;
                const difficulty = entry.querySelector('.difficulty').value;
                
                // Collect topics
                const topicTags = entry.querySelectorAll('.topic-tag');
                const topics = Array.from(topicTags).map(tag => {
                    return tag.textContent.replace('×', '').trim();
                });
                
                if (subject && date) {
                    exams.push({ 
                        subject, 
                        date: new Date(date), 
                        difficulty,
                        topics: topics.length > 0 ? topics : null
                    });
                }
            });

            if (exams.length === 0) {
                alert('Please enter at least one exam with subject name and date.');
                return;
            }

            // Sort exams by date
            exams.sort((a, b) => a.date - b.date);

            // Calculate days until each exam and total study time
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            exams.forEach(exam => {
                const examDate = new Date(exam.date);
                examDate.setHours(0, 0, 0, 0);
                exam.daysUntil = Math.max(1, Math.ceil((examDate - today) / (1000 * 60 * 60 * 24)));
                
                // Allocate hours based on difficulty
                const baseHours = {
                    'easy': 15,
                    'medium': 25,
                    'hard': 35
                };
                exam.totalHours = baseHours[exam.difficulty];
                
                // Adjust total hours based on number of topics
                if (exam.topics && exam.topics.length > 0) {
                    const topicMultiplier = Math.min(1.5, 1 + (exam.topics.length * 0.1));
                    exam.totalHours = Math.ceil(exam.totalHours * topicMultiplier);
                }
                
                exam.hoursPerDay = Math.min(4, exam.totalHours / exam.daysUntil);
            });

            // Generate unified schedule for all exams (prevents time conflicts)
            const unifiedSchedule = generateUnifiedSchedule(exams, customTimeSlots);

            // Generate schedule HTML grouped by subject
            let scheduleHTML = '';
            let totalStudyHours = 0;
            let totalTopics = 0;

            exams.forEach(exam => {
                totalStudyHours += exam.totalHours;
                if (exam.topics) totalTopics += exam.topics.length;
                
                const topicsText = exam.topics && exam.topics.length > 0 
                    ? `${exam.topics.length} topic${exam.topics.length > 1 ? 's' : ''}` 
                    : 'General review';
                
                // Get sessions for this exam
                const examSessions = unifiedSchedule.filter(s => s.subject === exam.subject);
                
                scheduleHTML += `
                    <div class="subject-plan">
                        <h3>${exam.subject}</h3>
                        <p style="color: #666; margin-bottom: 15px;">
                            Exam in ${exam.daysUntil} day${exam.daysUntil > 1 ? 's' : ''} 
                            • Difficulty: ${exam.difficulty.charAt(0).toUpperCase() + exam.difficulty.slice(1)}
                            • ${topicsText}
                            • Total study time: ${exam.totalHours} hours
                        </p>
                `;

                examSessions.forEach(session => {
                    let topicHTML = '';
                    if (session.topic) {
                        topicHTML = `<div class="topic-focus">Focus: ${session.topic}</div>`;
                    }
                    
                    scheduleHTML += `
                        <div class="time-slot">
                            <div class="time-slot-header">
                                <div class="time-slot-info">
                                    <span><strong>${session.day}</strong></span>
                                    <span class="time-badge">${session.timeSlot}</span>
                                </div>
                                <span class="duration-badge">${session.duration}</span>
                            </div>
                            <div style="margin-top: 8px;">
                                <strong style="color: #333;">${session.activity}</strong>
                            </div>
                            ${topicHTML}
                        </div>
                    `;
                });

                scheduleHTML += `</div>`;
            });

            // Calculate average hours per day
            const maxDays = Math.max(...exams.map(e => e.daysUntil));
            const avgHoursPerDay = (totalStudyHours / maxDays).toFixed(1);
            
            // Format total study hours properly
            const totalHours = Math.floor(totalStudyHours);
            const totalMinutes = Math.round((totalStudyHours - totalHours) * 60);
            let totalStudyTime = totalHours > 0 ? `${totalHours} hr` : '';
            if (totalMinutes > 0) {
                totalStudyTime += totalHours > 0 ? ` ${totalMinutes} min` : `${totalMinutes} min`;
            }
            if (!totalStudyTime) totalStudyTime = '0 hr';

            // Update stats
            document.getElementById('stats').innerHTML = `
                <div class="stat-card">
                    <div class="stat-value">${exams.length}</div>
                    <div class="stat-label">Total Exams</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${totalTopics}</div>
                    <div class="stat-label">Topics to Cover</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value" style="font-size: 1.5em;">${totalStudyTime}</div>
                    <div class="stat-label">Total Study Time</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${avgHoursPerDay}</div>
                    <div class="stat-label">Avg Hours/Day</div>
                </div>
            `;

            document.getElementById('scheduleContent').innerHTML = scheduleHTML;
            document.getElementById('scheduleCard').classList.add('show');
            
            // Show and populate timer section
            document.getElementById('timerSection').style.display = 'block';
            populateSessionSelector(unifiedSchedule);
            updateTodayStats();
            
            // Scroll to schedule
            document.getElementById('scheduleCard').scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        // Populate session selector dropdown
        function populateSessionSelector(schedule) {
            const select = document.getElementById('sessionSelect');
            select.innerHTML = '<option value="">Choose a session to start...</option>';
            
            schedule.forEach((session, index) => {
                const option = document.createElement('option');
                option.value = index;
                option.textContent = `${session.day} - ${session.timeSlot} - ${session.activity}`;
                select.appendChild(option);
            });

            // Add change event listener
            select.addEventListener('change', function() {
                if (this.value !== '') {
                    const sessionIndex = parseInt(this.value);
                    const session = schedule[sessionIndex];
                    currentSessionId = `session_${sessionIndex}`;
                    
                    document.getElementById('currentSessionTitle').textContent = session.subject;
                    document.getElementById('currentSessionDetails').textContent = 
                        `${session.day} • ${session.timeSlot} • ${session.activity}${session.topic ? ' • ' + session.topic : ''}`;
                    
                    document.getElementById('activeTimerDisplay').style.display = 'block';
                    
                    // Reset timer if switching sessions
                    if (isTimerRunning) {
                        stopTimer();
                    }
                }
            });
        }

        // Timer functions
        function startTimer() {
            if (!currentSessionId) {
                alert('Please select a session first');
                return;
            }

            isTimerRunning = true;
            isPaused = false;
            
            document.getElementById('startBtn').disabled = true;
            document.getElementById('pauseBtn').disabled = false;
            document.getElementById('stopBtn').disabled = false;
            document.getElementById('timerStatus').textContent = 'Studying...';

            timerInterval = setInterval(() => {
                timerSeconds++;
                updateTimerDisplay();
            }, 1000);
        }

        function pauseTimer() {
            if (!isTimerRunning) return;

            isPaused = !isPaused;
            
            if (isPaused) {
                clearInterval(timerInterval);
                document.getElementById('pauseBtn').textContent = '▶️ Resume';
                document.getElementById('timerStatus').textContent = 'Paused';
            } else {
                timerInterval = setInterval(() => {
                    timerSeconds++;
                    updateTimerDisplay();
                }, 1000);
                document.getElementById('pauseBtn').textContent = '⏸️ Pause';
                document.getElementById('timerStatus').textContent = 'Studying...';
            }
        }

        function stopTimer() {
            if (!isTimerRunning && timerSeconds === 0) return;

            clearInterval(timerInterval);
            
            // Save session data
            const minutes = Math.floor(timerSeconds / 60);
            const today = new Date().toISOString().split('T')[0];
            
            const sessionData = {
                id: currentSessionId,
                date: today,
                minutes: minutes,
                timestamp: new Date().toISOString()
            };

            studyData.completedSessions.push(sessionData);
            studyData.totalMinutesStudied += minutes;
            
            // Update streak
            if (studyData.lastStudyDate !== today) {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayStr = yesterday.toISOString().split('T')[0];
                
                if (studyData.lastStudyDate === yesterdayStr) {
                    studyData.streak++;
                } else if (studyData.lastStudyDate === null) {
                    studyData.streak = 1;
                } else {
                    studyData.streak = 1;
                }
                studyData.lastStudyDate = today;
            }
            
            saveStudyData();
            
            // Show completion message
            alert(`Great job! You studied for ${minutes} minutes and ${timerSeconds % 60} seconds.`);
            
            // Reset timer
            isTimerRunning = false;
            isPaused = false;
            timerSeconds = 0;
            
            document.getElementById('startBtn').disabled = false;
            document.getElementById('pauseBtn').disabled = true;
            document.getElementById('pauseBtn').textContent = '⏸️ Pause';
            document.getElementById('stopBtn').disabled = true;
            document.getElementById('timerStatus').textContent = 'Session completed!';
            document.getElementById('timerClock').textContent = '00:00:00';
            
            updateTodayStats();
        }

        function updateTimerDisplay() {
            const hours = Math.floor(timerSeconds / 3600);
            const minutes = Math.floor((timerSeconds % 3600) / 60);
            const seconds = timerSeconds % 60;
            
            const display = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            document.getElementById('timerClock').textContent = display;
        }

        function updateTodayStats() {
            const today = new Date().toISOString().split('T')[0];
            const todaySessions = studyData.completedSessions.filter(s => s.date === today);
            const todayMinutes = todaySessions.reduce((sum, s) => sum + s.minutes, 0);
            
            document.getElementById('todaySessionsCount').textContent = todaySessions.length;
            document.getElementById('todayMinutes').textContent = todayMinutes + 'm';
            document.getElementById('streakDays').textContent = studyData.streak;
        }

        // FIXED: New function to generate unified schedule with proper conflict prevention
        function generateUnifiedSchedule(exams, customTimeSlots) {
            const allSessions = [];
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            // Helper function to format duration
            function formatDuration(minutes) {
                const hours = Math.floor(minutes / 60);
                const mins = Math.round(minutes % 60);
                
                if (hours > 0 && mins > 0) {
                    return `${hours} hr ${mins} min`;
                } else if (hours > 0) {
                    return `${hours} hr`;
                } else {
                    return `${mins} min`;
                }
            }

            // Function to get date string
            function getDateString(date) {
                return date.toISOString().split('T')[0];
            }

            // Calculate days range - use the maximum days until any exam
            const maxDays = Math.max(...exams.map(e => e.daysUntil));
            
            // Create study sessions for each exam
            const examSessions = exams.map(exam => {
                const hasTopics = exam.topics && exam.topics.length > 0;
                const defaultActivities = [
                    'Review fundamentals and key concepts',
                    'Practice problems and exercises',
                    'Deep dive into difficult areas',
                    'Practice tests and mock exams',
                    'Final revision and summary'
                ];

                const sessions = [];
                const totalMinutes = exam.totalHours * 60;
                const numSessions = Math.ceil(totalMinutes / 120); // 2 hours per session
                
                for (let i = 0; i < numSessions; i++) {
                    let activity, topic;
                    
                    if (hasTopics) {
                        topic = exam.topics[i % exam.topics.length];
                        const topicActivities = [
                            'Introduction and fundamentals',
                            'Deep study and practice',
                            'Problem solving and review',
                            'Revision and exercises'
                        ];
                        activity = topicActivities[i % topicActivities.length];
                    } else {
                        activity = defaultActivities[i % defaultActivities.length];
                        topic = null;
                    }
                    
                    sessions.push({
                        subject: exam.subject,
                        activity: activity,
                        topic: topic,
                        examDate: exam.date,
                        daysUntilExam: exam.daysUntil,
                        scheduled: false
                    });
                }
                
                return {
                    subject: exam.subject,
                    sessions: sessions,
                    daysUntilExam: exam.daysUntilExam,
                    currentSessionIndex: 0
                };
            });

            // Sort exams by date (sooner exams get priority)
            examSessions.sort((a, b) => a.daysUntilExam - b.daysUntilExam);

            // CRITICAL FIX: Create a calendar to track occupied time slots
            // Structure: Map of "YYYY-MM-DD_slotIndex" -> subject name
            const occupiedSlots = new Map();

            // Schedule sessions day by day, cycling through subjects to distribute them
            for (let dayOffset = 0; dayOffset < maxDays; dayOffset++) {
                const currentDate = new Date(today.getTime() + (dayOffset * 24 * 60 * 60 * 1000));
                const dateString = getDateString(currentDate);
                const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

                // For each time slot on this day
                for (let slotIndex = 0; slotIndex < customTimeSlots.length; slotIndex++) {
                    const slotKey = `${dateString}_${slotIndex}`;
                    
                    // CRITICAL: Check if this slot is already occupied
                    if (occupiedSlots.has(slotKey)) {
                        continue; // Skip this slot, it's already taken
                    }

                    // Find the highest priority exam that needs scheduling and hasn't passed its exam date
                    let sessionScheduled = false;
                    
                    for (let examIndex = 0; examIndex < examSessions.length; examIndex++) {
                        const exam = examSessions[examIndex];
                        
                        // Check if current date is before exam date
                        if (currentDate >= exam.sessions[0].examDate) {
                            continue; // Don't schedule sessions after exam date
                        }

                        // Get the next unscheduled session for this exam
                        const sessionIndex = exam.currentSessionIndex;
                        
                        if (sessionIndex < exam.sessions.length) {
                            const session = exam.sessions[sessionIndex];
                            const timeSlot = customTimeSlots[slotIndex];
                            
                            // CRITICAL: Mark this slot as occupied for this subject
                            occupiedSlots.set(slotKey, exam.subject);
                            
                            // Mark session as scheduled
                            session.scheduled = true;
                            exam.currentSessionIndex++; // Move to next session for this exam
                            
                            // Add to final schedule
                            allSessions.push({
                                subject: exam.subject,
                                day: dayName,
                                date: currentDate,
                                timeSlot: timeSlot.timeSlot,
                                activity: session.activity,
                                topic: session.topic,
                                duration: formatDuration(timeSlot.durationMinutes)
                            });
                            
                            sessionScheduled = true;
                            break; // Move to next time slot
                        }
                    }
                }
            }

            // Sort all sessions by date and time for display
            allSessions.sort((a, b) => a.date - b.date);

            return allSessions;
        }

        // Tab switching functionality
        function switchTab(tabName) {
            // Update tab buttons
            document.querySelectorAll('.tab').forEach(tab => {
                tab.classList.remove('active');
            });
            event.target.classList.add('active');

            // Update tab content
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });

            if (tabName === 'schedule') {
                document.getElementById('scheduleTab').classList.add('active');
            } else if (tabName === 'analytics') {
                document.getElementById('analyticsTab').classList.add('active');
                updateAnalytics();
            }
        }

        // Analytics calculation and update
        function updateAnalytics() {
            const entries = document.querySelectorAll('.exam-entry');
            if (entries.length === 0) return;

            const entry = entries[0];
            const subject = entry.querySelector('.subject-name').value.trim();
            const difficulty = entry.querySelector('.difficulty').value;
            
            // Get topics
            const topicTags = entry.querySelectorAll('.topic-tag');
            const topics = Array.from(topicTags).map(tag => {
                return tag.textContent.replace('×', '').trim();
            });

            // Calculate sessions from the schedule
            const scheduledSessions = document.querySelectorAll('.time-slot').length;
            
            // Use real data from studyData
            const completedSessions = studyData.completedSessions.length;
            const totalMinutesStudied = studyData.totalMinutesStudied;
            
            // Calculate missed sessions (sessions that were scheduled for past dates but not completed)
            const today = new Date();
            const missedSessions = calculateMissedSessions();
            
            // Calculate metrics
            const completionRate = scheduledSessions > 0 ? (completedSessions / scheduledSessions * 100).toFixed(0) : 0;
            
            // Overall efficiency (0-100 score based on multiple factors)
            const consistencyFactor = Math.max(0, 100 - (missedSessions * 10));
            const completionFactor = parseFloat(completionRate);
            const timeManagementFactor = calculateTimeManagement();
            
            const efficiencyFactors = {
                completionRate: completionFactor * 0.4,
                consistency: consistencyFactor * 0.3,
                timeManagement: timeManagementFactor * 0.3
            };
            const overallEfficiency = Math.min(100, Math.max(0, 
                Object.values(efficiencyFactors).reduce((a, b) => a + b, 0)
            )).toFixed(0);

            // Time utilization
            const plannedHours = scheduledSessions * 2; // Assuming 2 hours per session
            const studiedHours = (totalMinutesStudied / 60).toFixed(1);
            const timeUtilization = plannedHours > 0 ? ((studiedHours / plannedHours) * 100).toFixed(0) : 0;

            // Consistency score (based on study pattern)
            const consistencyScore = Math.max(0, 100 - (missedSessions * 15));

            // Update metrics
            document.getElementById('overallEfficiency').textContent = overallEfficiency + '%';
            document.getElementById('sessionsCompleted').textContent = completedSessions;
            document.getElementById('sessionsTotal').textContent = `of ${scheduledSessions} total`;
            document.getElementById('timeUtilization').textContent = timeUtilization + '%';
            document.getElementById('consistencyScore').textContent = consistencyScore + '%';

            // Update overall progress
            document.getElementById('overallProgressPercent').textContent = completionRate + '%';
            document.getElementById('overallProgressBar').style.width = completionRate + '%';
            document.getElementById('overallProgressText').textContent = completionRate + '%';

            // Update topic progress based on real data
            let topicProgressHTML = '';
            if (topics.length > 0) {
                topicProgressHTML = '<h4 style="margin-top: 20px; margin-bottom: 15px; color: #667eea;">Topic Breakdown</h4>';
                topics.forEach((topic, index) => {
                    // Calculate progress based on completed sessions for this topic
                    const topicSessions = studyData.completedSessions.filter(s => 
                        s.id && s.id.includes(topic.toLowerCase().substring(0, 5))
                    );
                    const topicProgress = Math.min(100, (topicSessions.length / Math.max(1, scheduledSessions / topics.length)) * 100).toFixed(0);
                    
                    topicProgressHTML += `
                        <div class="topic-progress-item">
                            <div class="topic-name">
                                <span>${topic}</span>
                                <span style="color: #667eea;">${topicProgress}%</span>
                            </div>
                            <div class="progress-bar-container" style="height: 20px;">
                                <div class="progress-bar" style="width: ${topicProgress}%; font-size: 0.8em;"></div>
                            </div>
                        </div>
                    `;
                });
            }
            document.getElementById('topicProgressContainer').innerHTML = topicProgressHTML;

            // Efficiency Analysis
            let efficiencyHTML = '';
            const efficiencyLevel = overallEfficiency >= 80 ? 'high' : overallEfficiency >= 60 ? 'medium' : 'low';
            const efficiencyClass = `efficiency-${efficiencyLevel}`;
            const efficiencyText = efficiencyLevel.charAt(0).toUpperCase() + efficiencyLevel.slice(1);

            efficiencyHTML = `
                <div style="margin-bottom: 20px;">
                    <span style="font-weight: 600; color: #333;">Current Efficiency Level: </span>
                    <span class="efficiency-indicator ${efficiencyClass}">${efficiencyText} (${overallEfficiency}%)</span>
                </div>
                <div style="display: grid; gap: 15px;">
                    <div style="padding: 15px; background: #f8f9fa; border-radius: 8px;">
                        <strong style="color: #333;">Completion Rate:</strong>
                        <div style="margin-top: 5px; color: #666;">You've completed ${completedSessions} out of ${scheduledSessions} planned sessions (${completionRate}%)</div>
                    </div>
                    <div style="padding: 15px; background: #f8f9fa; border-radius: 8px;">
                        <strong style="color: #333;">Consistency:</strong>
                        <div style="margin-top: 5px; color: #666;">${missedSessions === 0 ? 'Excellent! No missed sessions.' : `You've missed ${missedSessions} session(s). Try to maintain consistency.`}</div>
                        <div style="margin-top: 5px; color: #667eea; font-weight: 600;">Current Streak: ${studyData.streak} day${studyData.streak !== 1 ? 's' : ''}</div>
                    </div>
                    <div style="padding: 15px; background: #f8f9fa; border-radius: 8px;">
                        <strong style="color: #333;">Time Management:</strong>
                        <div style="margin-top: 5px; color: #666;">You're utilizing ${timeUtilization}% of your planned study time (${studiedHours} of ${plannedHours} hours)</div>
                    </div>
                </div>
            `;
            document.getElementById('efficiencyAnalysis').innerHTML = efficiencyHTML;

            // Generate recommendations
            let recommendationsHTML = '';
            const recommendations = [];

            if (completionRate < 70) {
                recommendations.push({
                    title: '🎯 Improve Completion Rate',
                    text: `Your completion rate is ${completionRate}%. Try to stick to your scheduled study times and break sessions into smaller, manageable chunks if needed.`
                });
            }

            if (missedSessions > 2) {
                recommendations.push({
                    title: '⏰ Reduce Missed Sessions',
                    text: `You've missed ${missedSessions} sessions. Set reminders 15 minutes before each study session and prepare your study materials in advance.`
                });
            }

            if (consistencyScore < 70) {
                recommendations.push({
                    title: '📅 Build Consistency',
                    text: 'Study at the same times each day to build a habit. Consistent study schedules lead to better retention and less stress.'
                });
            }

            if (studyData.streak >= 7) {
                recommendations.push({
                    title: '🔥 Amazing Streak!',
                    text: `You've maintained a ${studyData.streak}-day study streak! Keep up the excellent momentum and watch your progress soar.`
                });
            }

            if (difficulty === 'hard' && completionRate > 80) {
                recommendations.push({
                    title: '🌟 Excellent Progress!',
                    text: 'You\'re doing great with a difficult subject! Consider teaching concepts to others or creating summary notes to reinforce your learning.'
                });
            }

            if (topics.length > 5) {
                recommendations.push({
                    title: '📚 Focus Strategy',
                    text: `With ${topics.length} topics to cover, prioritize the most challenging ones early in your study sessions when your energy is highest.`
                });
            }

            if (totalMinutesStudied > 0 && completedSessions > 0) {
                const avgMinutesPerSession = Math.round(totalMinutesStudied / completedSessions);
                if (avgMinutesPerSession < 60) {
                    recommendations.push({
                        title: '⏱️ Extend Session Duration',
                        text: `Your average session is ${avgMinutesPerSession} minutes. Try to aim for at least 60-90 minutes per session for better focus and retention.`
                    });
                }
            }

            if (recommendations.length === 0) {
                recommendations.push({
                    title: '✅ Great Job!',
                    text: 'You\'re on track with your study plan! Keep up the good work and maintain your current study habits.'
                });
            }

            recommendations.forEach(rec => {
                recommendationsHTML += `
                    <div class="recommendation-card">
                        <h4>${rec.title}</h4>
                        <p>${rec.text}</p>
                    </div>
                `;
            });
            document.getElementById('recommendations').innerHTML = recommendationsHTML;

            // Generate session log with real data
            let sessionLogHTML = '';
            const sessions = document.querySelectorAll('.time-slot');
            
            if (sessions.length === 0) {
                sessionLogHTML = '<p style="text-align: center; color: #999; padding: 20px;">No sessions scheduled yet. Generate a study plan to see your session history.</p>';
            } else {
                // Show completed sessions from studyData
                if (studyData.completedSessions.length > 0) {
                    const sortedSessions = [...studyData.completedSessions].sort((a, b) => 
                        new Date(b.timestamp) - new Date(a.timestamp)
                    );
                    
                    sortedSessions.forEach(session => {
                        const date = new Date(session.timestamp);
                        const dateStr = date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
                        const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                        
                        sessionLogHTML += `
                            <div class="session-item">
                                <div class="session-info">
                                    <div class="session-date">${dateStr}</div>
                                    <div class="session-details">${timeStr} • ${session.minutes} minutes studied</div>
                                </div>
                                <span class="session-status status-completed">Completed</span>
                            </div>
                        `;
                    });
                }
                
                // Show upcoming sessions
                const today = new Date();
                sessions.forEach((session, index) => {
                    const isCompleted = studyData.completedSessions.some(s => s.id === `session_${index}`);
                    if (!isCompleted) {
                        const dayText = session.querySelector('.time-slot-info span strong').textContent;
                        const timeText = session.querySelector('.time-badge').textContent;
                        const activityText = session.querySelector('.time-slot div strong').textContent;
                        
                        sessionLogHTML += `
                            <div class="session-item">
                                <div class="session-info">
                                    <div class="session-date">${dayText}</div>
                                    <div class="session-details">${timeText} • ${activityText}</div>
                                </div>
                                <span class="session-status status-upcoming">Upcoming</span>
                            </div>
                        `;
                    }
                });
            }
            document.getElementById('sessionLog').innerHTML = sessionLogHTML;
        }

        // Helper function to calculate missed sessions
        function calculateMissedSessions() {
            // This is a simplified calculation
            // In a real app, you'd track which specific sessions were missed
            const scheduledSessions = document.querySelectorAll('.time-slot').length;
            const completedSessions = studyData.completedSessions.length;
            
            // Estimate missed sessions based on days passed
            const today = new Date();
            const daysPassed = Math.floor((today - new Date(studyData.lastStudyDate || today)) / (1000 * 60 * 60 * 24));
            
            return Math.max(0, Math.min(scheduledSessions - completedSessions, daysPassed));
        }

        // Helper function to calculate time management score
        function calculateTimeManagement() {
            const completedSessions = studyData.completedSessions.length;
            if (completedSessions === 0) return 0;
            
            const avgMinutesPerSession = studyData.totalMinutesStudied / completedSessions;
            const targetMinutes = 120; // 2 hours target
            
            // Score based on how close to target
            const score = Math.min(100, (avgMinutesPerSession / targetMinutes) * 100);
            return score;
        }