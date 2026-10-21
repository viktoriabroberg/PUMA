import {NativeTabs} from 'expo-router/unstable-native-tabs';
//För att kuna dölja navbaren
import { useSegments } from 'expo-router';
import { COLORS } from '../../constants/colors';

export default function TabLayout(){
    const segments = useSegments();
    const inCamera = segments.includes('camera');
    return (
        <NativeTabs hidden={inCamera} tintColor={COLORS.green}>
            <NativeTabs.Trigger name="map">
                <NativeTabs.Trigger.Icon sf ="map"/>
                <NativeTabs.Trigger.Label>Karta</NativeTabs.Trigger.Label>
            </NativeTabs.Trigger>

            <NativeTabs.Trigger name="places">
                <NativeTabs.Trigger.Icon sf ="mappin.and.ellipse"/>
                <NativeTabs.Trigger.Label>Platser</NativeTabs.Trigger.Label>
            </NativeTabs.Trigger>

            <NativeTabs.Trigger name="identify">
                <NativeTabs.Trigger.Icon sf ="magnifyingglass"/>
                <NativeTabs.Trigger.Label>Identifiera</NativeTabs.Trigger.Label>
            </NativeTabs.Trigger>

            <NativeTabs.Trigger name="user">
                <NativeTabs.Trigger.Icon sf ="person.fill"/>
                <NativeTabs.Trigger.Label>Användare</NativeTabs.Trigger.Label>
            </NativeTabs.Trigger>

        </NativeTabs>
    );
}
