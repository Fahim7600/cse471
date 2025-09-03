const PetProfile = require('../models/PetProfile');
const Notification = require('../models/Notification');
const User = require('../models/User');

// Function to create a notification
const createNotification = async (userId, message, type = 'info') => {
    try {
        const notification = new Notification({
            userId,
            message,
            type
        });
        await notification.save();
        console.log(`Notification created for user ${userId}: ${message}`);
    } catch (error) {
        console.error('Error creating notification:', error);
    }
};

// Function to mark notifications as read for past events
const markPastNotificationsAsRead = async () => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set to start of day
        
        // Find all notifications that contain date information
        const notifications = await Notification.find({
            message: { $regex: /(vaccination|appointment)/i },
            isRead: false
        });

        for (const notification of notifications) {
            // Extract date information from the message
            const message = notification.message;
            const daysMatch = message.match(/(\d+)\s+days?/);
            
            if (daysMatch) {
                const daysUntil = parseInt(daysMatch[1]);
                // If the event is today or in the past, mark as read
                if (daysUntil <= 0) {
                    await Notification.findByIdAndUpdate(notification._id, { isRead: true });
                    console.log(`Marked notification as read: ${notification._id}`);
                }
            }
        }
    } catch (error) {
        console.error('Error marking past notifications as read:', error);
    }
};

// Function to check upcoming vaccinations and appointments
const checkUpcomingEvents = async () => {
    try {
        console.log('Checking for upcoming events...');
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set to start of day
        const threeDaysFromNow = new Date(today);
        threeDaysFromNow.setDate(today.getDate() + 3);

        // First, mark past notifications as read
        await markPastNotificationsAsRead();

        // Find all pets with upcoming vaccinations or appointments
        const pets = await PetProfile.find({
            $or: [
                {
                    'vaccinations.nextVaccinationDate': {
                        $gte: today,
                        $lte: threeDaysFromNow
                    }
                },
                {
                    'vetAppointments.dateOfAppointment': {
                        $gte: today,
                        $lte: threeDaysFromNow
                    }
                }
            ]
        }).populate('owner');

        console.log(`Found ${pets.length} pets with upcoming events`);

        for (const pet of pets) {
            if (!pet.owner || !pet.owner._id) {
                console.log(`Skipping pet ${pet.name} - no owner found`);
                continue;
            }

            // Check vaccinations
            const upcomingVaccinations = pet.vaccinations.filter(vaccination => {
                const nextDate = new Date(vaccination.nextVaccinationDate);
                nextDate.setHours(0, 0, 0, 0);
                return nextDate && nextDate >= today && nextDate <= threeDaysFromNow;
            });

            // Check appointments
            const upcomingAppointments = pet.vetAppointments.filter(appointment => {
                if (!appointment.dateOfAppointment) {
                    console.log(`Skipping appointment for ${pet.name} - no date set`);
                    return false;
                }
                const appointmentDate = new Date(appointment.dateOfAppointment);
                appointmentDate.setHours(0, 0, 0, 0);
                return appointmentDate >= today && appointmentDate <= threeDaysFromNow;
            });

            console.log(`Pet ${pet.name} has ${upcomingVaccinations.length} upcoming vaccinations and ${upcomingAppointments.length} upcoming appointments`);

            // Create notifications for vaccinations
            for (const vaccination of upcomingVaccinations) {
                const nextDate = new Date(vaccination.nextVaccinationDate);
                nextDate.setHours(0, 0, 0, 0);
                const daysUntil = Math.ceil((nextDate - today) / (1000 * 60 * 60 * 24));
                await createNotification(
                    pet.owner._id,
                    `Reminder: ${pet.name}'s ${vaccination.vaccineName} vaccination is due in ${daysUntil} days.`,
                    'warning'
                );
            }

            // Create notifications for appointments
            for (const appointment of upcomingAppointments) {
                const appointmentDate = new Date(appointment.dateOfAppointment);
                appointmentDate.setHours(0, 0, 0, 0);
                const daysUntil = Math.ceil((appointmentDate - today) / (1000 * 60 * 60 * 24));
                console.log(`Creating appointment reminder for ${pet.name} - ${daysUntil} days until appointment`);
                await createNotification(
                    pet.owner._id,
                    `Reminder: ${pet.name} has a vet appointment with Dr. ${appointment.doctorName} in ${daysUntil} days.`,
                    'warning'
                );
            }
        }
    } catch (error) {
        console.error('Error checking upcoming events:', error);
    }
};

// Function to start the reminder service
const startReminderService = () => {
    console.log('Starting reminder service...');
    
    // Check for upcoming events every hour
    setInterval(checkUpcomingEvents, 60 * 60 * 1000);
    
    // Initial check when the service starts
    checkUpcomingEvents();
};

module.exports = {
    startReminderService
}; 