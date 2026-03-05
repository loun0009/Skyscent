import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { theme } from "../theme";

interface Props {
    rating: number;
    maxStars?: number;
    size?: number;
    onRate?: (rating: number) => void;
    readonly?: boolean;
}

export const StarRating = ({ rating, maxStars = 5, size = 24, onRate, readonly = false }: Props) => {
    return (
        <View style={styles.row}>
            {Array.from({ length: maxStars}).map((_, i) => {
                const filled = i < Math.round(rating);
                return readonly ? (
                    <Text key={i} style={[styles.star, {fontSize: size}]}>
                        {filled ? "⭐" : "☆"}
                    </Text>
                ) : (
                    <TouchableOpacity key={i} onPress={() => onRate?.(i + 1)}>
                        <Text style={[styles.star, {fontSize: size}]}>
                            {filled ? "⭐" : "☆"}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    row: {
        flexDirection: "row",
        gap: 4,
    },
    star: {
        color: theme.colors.gold,
    },
});