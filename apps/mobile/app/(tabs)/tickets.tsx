import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '@/components/ui/Card';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link } from 'expo-router';

const ACTIVE_TICKET = {
    id: '1',
    eventTitle: 'Campus Hackathon 2025',
    date: 'Jan 15, 2025',
    time: '9:00 AM',
    location: 'Main Auditorium',
    ticketNumber: '#829-22-XA',
    qrCode: true,
};

const PAST_TICKETS = [
    { id: '2', eventTitle: 'AI Workshop', date: 'Dec 10, 2024', status: 'completed' },
    { id: '3', eventTitle: 'Music Fest', date: 'Nov 28, 2024', status: 'completed' },
];

export default function TicketsScreen() {
    return (
        <View className="flex-1 bg-gray-50">
            <SafeAreaView className="flex-1">
                {/* Header */}
                <View className="px-5 pt-4 pb-2">
                    <Text className="text-gray-900 text-2xl font-bold">My Tickets</Text>
                    <Text className="text-gray-500 text-sm">Your event registrations</Text>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
                    {/* Active Ticket */}
                    <View className="px-5 py-4">
                        <Text className="text-gray-900 font-semibold mb-3">Active Ticket</Text>

                        <View className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100">
                            {/* Ticket Header */}
                            <View className="bg-primary-500 px-5 py-4">
                                <View className="flex-row justify-between items-start">
                                    <View className="flex-1">
                                        <Text className="text-white/80 text-xs uppercase tracking-wider mb-1">Upcoming Event</Text>
                                        <Text className="text-white font-bold text-xl">{ACTIVE_TICKET.eventTitle}</Text>
                                    </View>
                                    <TouchableOpacity className="bg-white/20 p-2 rounded-full">
                                        <FontAwesome name="share-alt" size={16} color="white" />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Ticket Info */}
                            <View className="px-5 py-4 border-b border-dashed border-gray-200">
                                <View className="flex-row justify-between mb-3">
                                    <View>
                                        <Text className="text-gray-400 text-xs uppercase">Date</Text>
                                        <Text className="text-gray-900 font-medium">{ACTIVE_TICKET.date}</Text>
                                    </View>
                                    <View>
                                        <Text className="text-gray-400 text-xs uppercase">Time</Text>
                                        <Text className="text-gray-900 font-medium">{ACTIVE_TICKET.time}</Text>
                                    </View>
                                </View>
                                <View>
                                    <Text className="text-gray-400 text-xs uppercase">Location</Text>
                                    <Text className="text-gray-900 font-medium">{ACTIVE_TICKET.location}</Text>
                                </View>
                            </View>

                            {/* QR Code */}
                            <View className="px-5 py-6 items-center">
                                <View className="w-48 h-48 bg-gray-100 rounded-xl items-center justify-center mb-3 p-2">
                                    {/* Mock QR Pattern */}
                                    <View className="flex-row flex-wrap w-full h-full gap-1 justify-center content-center">
                                        {[...Array(49)].map((_, i) => (
                                            <View
                                                key={i}
                                                className={`w-5 h-5 rounded-sm ${Math.random() > 0.4 ? 'bg-gray-900' : 'bg-transparent'}`}
                                            />
                                        ))}
                                    </View>
                                </View>
                                <Text className="text-gray-400 text-xs uppercase tracking-widest mb-1">Scan to Check In</Text>
                                <Text className="text-gray-900 font-mono text-lg font-bold">{ACTIVE_TICKET.ticketNumber}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Past Tickets */}
                    <View className="px-5 py-4 pb-24">
                        <Text className="text-gray-900 font-semibold mb-3">Past Events</Text>
                        <View className="gap-3">
                            {PAST_TICKETS.map((ticket) => (
                                <Card key={ticket.id} variant="outlined" className="flex-row items-center">
                                    <View className="w-12 h-12 bg-gray-100 rounded-lg items-center justify-center mr-3">
                                        <FontAwesome name="check-circle" size={24} color="#10B981" />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-gray-900 font-medium">{ticket.eventTitle}</Text>
                                        <Text className="text-gray-500 text-sm">{ticket.date}</Text>
                                    </View>
                                    <View className="bg-success/10 px-2 py-1 rounded-full">
                                        <Text className="text-success text-xs font-medium">Attended</Text>
                                    </View>
                                </Card>
                            ))}
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}
