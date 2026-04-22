// src/components/MediaCarouselSimple.tsx
// ALTERNATIVA: Carousel usando solo componentes nativos (sin librerías externas)
// ACTUALIZADO: Migrado de expo-av a expo-video

import React, { useState } from 'react';
import {
  View,
  Image,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface MediaCarouselSimpleProps {
  imageUrl: string;
  images?: string[];
  videoUrl?: string;
  height?: number;
}

// Componente separado para el video
const VideoItem = ({ url, isActive, height }: { url: string; isActive: boolean; height: number }) => {
  const { colors: COLORS } = useTheme();

  const player = useVideoPlayer(url, player => {
    player.loop = false;
  });

  React.useEffect(() => {
    if (!isActive && player) player.pause();
  }, [isActive, player]);

  return (
    <View style={{ width: SCREEN_WIDTH, height, backgroundColor: '#000000' }}>
      <VideoView
        style={{ width: '100%', height: '100%' }}
        player={player}
        allowsFullscreen
        allowsPictureInPicture
      />
      <View style={{
        position: 'absolute', top: 12, right: 12,
        backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 10,
        paddingVertical: 6, borderRadius: 16,
      }}>
        <Ionicons name="play-circle" size={16} color="#FFFFFF" />
      </View>
    </View>
  );
};

const MediaCarouselSimple: React.FC<MediaCarouselSimpleProps> = ({
  imageUrl,
  images = [],
  videoUrl,
  height = 250,
}) => {
  const { colors: COLORS } = useTheme();
  const [activeIndex, setActiveIndex] = useState(0);

  const styles = StyleSheet.create({
    mediaContainer: {
      backgroundColor: '#000000',
    },
    image: {
      width: '100%',
      height: '100%',
    },
    pagination: {
      position: 'absolute',
      bottom: 12,
      left: 0,
      right: 0,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 6,
    },
    paginationDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: 'rgba(255, 255, 255, 0.5)',
    },
    paginationDotActive: {
      width: 20,
      height: 6,
      borderRadius: 3,
      backgroundColor: COLORS.white,
    },
    counter: {
      position: 'absolute',
      top: 12,
      left: 12,
    },
    counterBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 16,
      gap: 4,
    },
    counterText: {
      fontSize: 12,
      fontWeight: '600',
      color: COLORS.white,
    },
  });

  const allMedia: Array<{ type: 'image' | 'video'; url: string }> = [
    { type: 'image', url: imageUrl },
    ...images.map(img => ({ type: 'image' as const, url: img })),
  ];

  if (videoUrl) {
    allMedia.push({ type: 'video', url: videoUrl });
  }

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setActiveIndex(index);
  };

  const renderMediaItem = (item: { type: 'image' | 'video'; url: string }, index: number) => {
    if (item.type === 'image') {
      return (
        <View key={index} style={[styles.mediaContainer, { width: SCREEN_WIDTH, height }]}>
          <Image source={{ uri: item.url }} style={styles.image} resizeMode="cover" />
        </View>
      );
    }
    return (
      <VideoItem key={index} url={item.url} isActive={activeIndex === index} height={height} />
    );
  };

  if (allMedia.length === 1) {
    return <View style={{ height }}>{renderMediaItem(allMedia[0], 0)}</View>;
  }

  return (
    <View style={{ height }}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        decelerationRate="fast"
        snapToInterval={SCREEN_WIDTH}
      >
        {allMedia.map((item, index) => renderMediaItem(item, index))}
      </ScrollView>

      <View style={styles.pagination}>
        {allMedia.map((_, index) => (
          <View
            key={index}
            style={[styles.paginationDot, activeIndex === index && styles.paginationDotActive]}
          />
        ))}
      </View>

      <View style={styles.counter}>
        <View style={styles.counterBadge}>
          <Ionicons name="images" size={12} color={COLORS.white} />
          <Text style={styles.counterText}>{activeIndex + 1}/{allMedia.length}</Text>
        </View>
      </View>
    </View>
  );
};

export default MediaCarouselSimple;