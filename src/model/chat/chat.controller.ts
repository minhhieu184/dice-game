import { Controller, Get, Query } from '@nestjs/common'
import { IChatService, InjectChatService } from './chat.service'
import { FindAllChatWithSeqQueryDto } from './dto'

@Controller('chat')
export class ChatController {
  constructor(@InjectChatService() private readonly chatService: IChatService) {}

  // @Post()
  // create(@Body() createChatDto: CreateChatDto) {
  //   return this.chatService.create(createChatDto)
  // }

  @Get()
  findAll(@Query() query: FindAllChatWithSeqQueryDto) {
    return this.chatService.findAllWithSeq(query)
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.chatService.findOne(+id)
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateChatDto: UpdateChatDto) {
  //   return this.chatService.update(+id, updateChatDto)
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.chatService.remove(+id)
  // }
}
