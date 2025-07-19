import pygame, sys
from pygame.locals import QUIT

pygame.init()
screen = pygame.display.set_mode((400, 400))
pygame.display.set_caption("test")

board = [['r','n','b','q','k','b','n','r'], 
        ['p','p','p','p','p','p','p','p'],
        ['','','','','','','',''],
        ['','','','','','','',''],
        ['','','','','','','',''],
        ['','','','','','','',''],
        ['P','P','P','P','P','P','P','P'],
        ['R','N','B','Q','K','B','N','R']]
def draw_board(board):
  for i in range(8):
    for j in range(8):
      color = (i+j)%2
      #print(color)
      if color == 0:
        pygame.draw.rect(screen,"white", (i*50,j*50,50,50))
      elif color == 1:
        pygame.draw.rect(screen,"black", (i*50,j*50,50,50))
  img = pygame.image.load("assets/bB.svg")
  screen.blit(img, (200,200))
draw_board(board)
while True:
  for event in pygame.event.get():
    if event.type == QUIT:
      pygame.quit()
      sys.exit()
  #DISPLAYSURF.fill('red')
  pygame.display.update()