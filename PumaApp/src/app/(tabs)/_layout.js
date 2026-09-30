import {NativeTabs} from 'expo-router/unstable-native-tabs';

export default function TabLayout(){
    return (
        <NativeTabs>
            <NativeTabs.Trigger name="map">
                <NativeTabs.Trigger.Icons sf ="map"/>
                <NativeTabs.Trigger.Label>Karta</NativeTabs.Trigger.Label>
            </NativeTabs.Trigger>

            <NativeTabs.Trigger name="places">
                <NativeTabs.Trigger.Icons sf ="mappin.and.ellipse"/>
                <NativeTabs.Trigger.Label>Platser</NativeTabs.Trigger.Label>
            </NativeTabs.Trigger>

            <NativeTabs.Trigger name="identify">
                <NativeTabs.Trigger.Icons sf ="magnifyingglass"/>
                <NativeTabs.Trigger.Label>Identifiera</NativeTabs.Trigger.Label>
            </NativeTabs.Trigger>

            <NativeTabs.Trigger name="user">
                <NativeTabs.Trigger.Icons sf ="person.fill"/>
                <NativeTabs.Trigger.Label>Användare</NativeTabs.Trigger.Label>
            </NativeTabs.Trigger>

        </NativeTabs>
    );
}
