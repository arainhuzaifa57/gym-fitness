const SearchableSectionList = ({ data }) => {
    const [searchText, setSearchText] = useState('');
    
    // Filter the data based on the search text
    const filteredData = data.filter((section) => {
      const filteredSectionData = section.data.filter(item =>
        item.toLowerCase().includes(searchText.toLowerCase())
      );
      return filteredSectionData.length > 0;
    });
  
    // Render item in the SectionList
    const renderItem = ({ item }) => (
      <ListItem bottomDivider>
        <ListItem.Content>
          <ListItem.Title>{item}</ListItem.Title>
        </ListItem.Content>
      </ListItem>
    );
  
    // Render each section in the SectionList
    const renderSectionHeader = ({ section: { title } }) => (
      <View style={{ backgroundColor: '#f0f0f0', padding: 10 }}>
        <Text style={{ fontWeight: 'bold' }}>{title}</Text>
      </View>
    );
  
    return (
      <View>
        <TextInput
          placeholder="Search..."
          onChangeText={setSearchText}
          value={searchText}
          style={{ paddingHorizontal: 16, paddingVertical: 8, borderBottomWidth: 1 }}
        />
        <SectionList
          sections={filteredData}
          keyExtractor={(item, index) => item + index}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
        />
      </View>
    );
  };
  
  export default SearchableSectionList;
  